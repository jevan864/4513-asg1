const express = require('express');
const supa = require('@supabase/supabase-js');
const app = express();

const supaUrl = 'https://wdkjxcsmlojjhhyzvfqc.supabase.co';
const supaAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2p4Y3NtbG9qamhoeXp2ZnFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg4OTIwNjEsImV4cCI6MjAyNDQ2ODA2MX0.W8RWcceIR8Qqn59ttKeQ5NTqEhAHESerTI8JPCbjlpk';

const supabase = supa.createClient(supaUrl, supaAnonKey);


//Returns the seasons supported by the API (all data in 'seasons')
app.get('/api/seasons', async (req, res) => { //TESTED
	const {data, error} = await supabase
	.from('seasons')
	.select();
	res.send(data);
});

//Returns all the circuits
app.get('/api/circuits', async (req, res) => { //TESTED
	const {data, error} = await supabase
	.from('circuits')
	.select();
	res.send(data);
});

//Returns specified circuit
app.get('/api/circuits/:ref', async (req, res) => { //TESTED
	const {data, error} = await supabase
	.from('circuits')
	.select()
	.eq('circuitRef',req.params.ref);
	if(!data){
		res.json({ error: `circuit not found.` });
	}
	res.send(data);
});

//Returns the circuits used in a given season
app.get('/api/circuits/season/:year', async (req, res) => {//TESTED
	const {data, error} = await supabase
	.from('races')
	.select('circuits(*)')
	.eq('year',req.params.year)
	.order('round', { ascending: true });
	res.send(data);
	if(!data){
		res.json({ error: `no data found; check year value.` });
	}
});

//Returns all the constructors
app.get('/api/constructors', async (req, res) => {//TESTED
	const {data, error} = await supabase
	.from('constructors')
	.select();
	res.send(data);
});

//Returns just the specified constructor
app.get('/api/constructors/:ref', async (req, res) => {//TESTED
	const {data, error} = await supabase
	.from('constructors')
	.select()
	.eq('constructorRef',req.params.ref);
	res.send(data);
	if(!data){
		res.json({ error: `constructor not found.` });
	}
});

//Returns all the drivers
app.get('/api/drivers', async (req, res) => {//TESTED
	const {data, error} = await supabase
	.from('races')
	.select()
	res.send(data);
});

//Returns just the specified driver
app.get('/api/drivers/:ref', async (req, res) => {//TESTED
	const {data, error} = await supabase
	.from('drivers')
	.select()
	.eq('driverRef',req.params.ref);
	res.send(data);
	if(!data){
		res.json({ error: `driver not found.` });
	}
});

//Returns the drivers whose surname (case insensitive) begins with the provided substring
app.get('/api/drivers/search/:substring', async (req, res) => { //TESTED
	const {data, error} = await supabase
	.from('drivers')
	.select()
	.ilike('driverRef', req.params.substring + '%');
	res.send(data);
	if(!data){
		res.json({ error: `no data found for given substring.` });
	}
});

//Returns the drivers within a given race
app.get('/api/drivers/race/:raceId', async (req, res) => {//TESTED
	const {data, error} = await supabase
	.from('results')
	.select('drivers(*)')
	.eq('raceId',req.params.raceId);
	res.send(data);
	if(!data){
		res.json({ error: `invalid race id.` });
	}
});

//Returns just the specified race. 
app.get('/api/races/:raceId', async (req, res) => { //WHEN TESTING: CHECK FOR Don’t provide the foreign key for the circuit; instead provide the circuit name, location, and country.
	const {data, error} = await supabase
	.from('races')
	.select()
	.eq('raceId',req.params.raceId);
	res.send(data);
	if(!data){
		res.json({ error: `invalid race id.` });
	}
});//TESTED BUT DIDNT CHECK FORMAT(see note)

//Returns the races within a given season ordered by round
app.get('/api/races/season/:year', async (req, res) => {//TESTED
	const {data, error} = await supabase
	.from('races')
	.select()
	.eq('year',req.params.year)
	.order('round', { ascending: true });
	res.send(data);
	if(!data){
		res.json({ error: `no races found; check year value.` });
	}
});

//Returns a specific race within a given season specified by the round number
app.get('/api/races/season/:year/:round', async (req, res) => {//TESTED
	const {data, error} = await supabase
	.from('races')
	.select()
	.eq('year',req.params.year)
	.eq('round', req.params.round);
	res.send(data);
	if(!data){
		res.json({ error: `no races found; check year or round value.` });
	}
});

//Returns all the races for a given circuit (ordered by year)
app.get('/api/races/circuits/:ref', async (req, res) => {//TESTED
	const {data, error} = await supabase
	.from('races')
	.select('*, circuits!inner()')
	.eq('circuits.circuitRef',req.params.ref)
	.order('year', { ascending : true });
	res.send(data);
	if(!data){
		res.json({ error: `circuit not found.` });
	}
});

//Returns all the races for a given circuit between two years
app.get('/api/races/circuits/:ref/season/:start/:end', async (req, res) => {//TESTED
	const {data, error} = await supabase
	.from('races')
	.select('*, circuits!inner()')
	.eq('circuits.circuitRef',req.params.ref)
	.gte('year', req.params.start)
	.lte('year', req.params.end);
	res.send(data);
	if(!data){
		if(req.params.end < req.params.start){
			res.json({ error: `initial year of range cannot be greater than final year of range`});
		}
		else{
			res.json({ error: `no races for given circuit found in range.` });
		}
	}
});

//Returns the results for the specified race
app.get('/api/results/:raceId', async (req, res) => { //TESTED
	const {data, error} = await supabase
	.from('results')
	.select('resultId, drivers(driverRef, code, forename, surname), races(name, round, year, date), constructors(name, constructorRef, nationality), number, grid, positionText, positionOrder, points, laps, time, milliseconds, fastestLap, rank, fastestLapTime, fastestLapSpeed')
	.eq('raceId', req.params.raceId)
	.order('grid', {ascending : true});
	res.send(data);
	if(!data){
		res.json({ error: `invalid race id.` });
	}
});

//Returns all the results for a given driver
app.get('/api/results/driver/:ref', async (req, res) => {//TESTED
	const {data, error} = await supabase
	.from('results')
	.select('*, drivers!inner()')
	.eq('drivers.driverRef', req.params.ref);
	res.send(data);
	if(!data){
		res.json({ error: `driver not found` });
	}
});

//Returns all the results for a given driver between two years
app.get('/api/results/driver/:ref/seasons/:start/:end', async (req, res) => {//TESTED
	const {data, error} = await supabase
	.from('results')
	.select('*, drivers!inner(), races!inner()')
	.eq('drivers.driverRef',req.params.ref)
	.gte('races.year', req.params.start)
	.lte('races.year', req.params.end);
	res.send(data);
	if(!data){
		if(req.params.end < req.params.start){
			res.json({ error: `initial year of range cannot be greater than final year of range`});
		}
		else{
			res.json({ error: `no races for given circuit found in range.` });
		}
	}
});

//Returns the qualifying results for the specified race, sorted by position in ascending order.
app.get('/api/qualifying/:raceId', async (req, res) => {//TESTED
	const {data, error} = await supabase
	.from('qualifying')
	.select('qualifyId, races(name, round, year, date), drivers(driverRef, code, forename, surname), constructors(name, constructorRef, nationality), number, position, q1, q2, q3')
	.eq('raceId',req.params.raceId);
	res.send(data);
	if(!data){
		res.json({ error: `invalid race id.` });
	}
});

//Returns the current season driver standings table for the specified race, sorted by position in ascending order.
app.get('/api/standings/:raceId/drivers', async (req, res) => {//TESTED
	const {data, error} = await supabase
	.from('driver_standings')
	.select('driverStandingsId, drivers(driverRef, code, forename, surname), points, position, wins')
	.eq('raceId',req.params.raceId);
	res.send(data);
	if(!data){
		res.json({ error: `invalid race id.` });
	}
});

//Returns the current season constructors standings table for the specified race, sorted by position in ascending order
app.get('/api/standings/:raceId/constructors', async (req, res) => {//TESTED
	const {data, error} = await supabase
	.from('constructor_standings')
	.select('constructorStandingsId, constructors(name, constructorRef, nationality), points, positionText, wins')
	.eq('raceId',req.params.raceId)
	.order('position', {ascending: true});
	res.send(data);
	if(!data){
		res.json({ error: `invalid race id.` });
	}
});

app.listen(8080, () => {
	console.log('listening on port 8080');
});