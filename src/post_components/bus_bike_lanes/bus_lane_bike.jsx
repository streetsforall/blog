import React, { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BusBike = (props) => {
  const [busStopFrequency, setBusStopFrequency] = useState(1);
  const [busFrequency, setBusFrequency] = useState(10);
  const [bikeFrequency, setBikeFrequency] = useState(5);
  const [time, setTime] = useState(60);
  const [busMaxSpeed, setBusMaxSpeed] = useState(25);
  const [bikeMaxSpeed, setBikeMaxSpeed] = useState(11);
  const [busStopTime, setBusStopTime] = useState(0.5);
  const [distance, setDistance] = useState(12);

  // States for simulation results
  const [averageBikeSpeed, setAverageBikeSpeed] = useState(0);
  const [averageBusSpeed, setAverageBusSpeed] = useState(0);
  const [chartData, setChartData] = useState([]);

  // Run simulation whenever parameters change
  useEffect(() => {
    runSimulation();
  }, [
    busStopFrequency,
    busFrequency,
    bikeFrequency,
    time,
    busMaxSpeed,
    bikeMaxSpeed,
    busStopTime,
    distance,
  ]);

  const runSimulation = () => {
    // data arrays
    const busesTimetable = [];
    const bikesTimetable = [];
    const bikes = [];
    const buses = [];

    const busStops = Array.from(
      { length: 100 },
      (_, i) => i * busStopFrequency
    );

    // Calculate spacing between vehicles (in minutes)
    const busSpacing = busFrequency > 0 ? 60 / busFrequency : 0;
    const bikeSpacing = bikeFrequency > 0 ? 60 / bikeFrequency : 0;

    console.log("busStops", busStops);

    var busCount = Math.ceil(busFrequency * (time / 60));
    var bikeCount =
      bikeFrequency > 0 ? Math.ceil(bikeFrequency * (time / 60)) : 0;

    // SPAWN BUSES
    for (let i = 1; i <= busCount; i++) {
      var new_bus = {
        busID: i,
        location: (i * busSpacing * busMaxSpeed) / 60,
        speed: busMaxSpeed,
        loading: 0,
      };

      buses.push(new_bus);
    }

    // SPAWN BIKES
    for (let i = 1; i <= bikeCount; i++) {
      var bike = {
        bikeID: i,
        location: (i * time/bikeMaxSpeed),
        speed: bikeMaxSpeed,
      };
      console.log(bikeSpacing)
      bikes.push(bike);
    }

    // increment every minute
    var i = 0;
    while (i < time) {
      i += 1;

      // spawn new buses and bikes every 'frequency'
      if (busFrequency > 0 &&  Number.isInteger(i / (60 / busFrequency)) || i == 1) {
        var new_bus = {
          busID: buses.length + 1,
          location: 0,
          speed: busMaxSpeed,
          loading: 0,
        };

        buses.push(new_bus);
        console.log(buses);
        console.log("new_bus", new_bus);
      }

      if (bikeFrequency > 0 && Number.isInteger(i / (60 / bikeFrequency)) || i == 2) {
        var bike = {
          bikeID: bikes.length + 1,
          location: 0,
          speed: bikeMaxSpeed,
        };
        bikes.push(bike);
      }


      //iterate bikes
      bikes.forEach((bike) => {
        // calculate new bus location
        var newBikeLocation = Number(bike.location) + Number(bike.speed) / 60;
        bike.location = newBikeLocation;
      });

      //iterate buses
      buses.forEach((bus) => {
        // calculate new bus location
        var newLocation = Number(bus.location) + Number(bus.speed) / 60;

        // check if bus is stuck behind other bus
        // buses.forEach((other_bus) => {
        //   // make sure we're only comparing other buses
        //   // check if new bus location will cause it to pass another bus
        //   if (other_bus.busID != bus.busID && bus.location < other_bus.location && other_bus.location < newLocation) {
        //     console.log("bus_" + bus.busID + "trying to pass " + other_bus.busID);
        //     newLocation = other_bus.location - .1
        //   }
        // });

        // check if bus is stuck behind a biker
        bikes.forEach((bike) => {
          // make sure we're only comparing other buses
          // check if new bus location will cause it to pass another bus
          if (bus.location < bike.location && bike.location < newLocation) {
            console.log(
              "bus_" + bus.busID + " is trying to pass bike " + bike.bikeID
            );

            // 66% odds of passing bike in given minute
            if (Math.random() < 0.66) {
              newLocation = bike.location - 0.1;
            }
          }
        });

        // check if bus stopped
        if (bus.loading > 0 && bus.loading < busStopTime) {
          bus.loading = bus.loading + (Math.random() + 0.1);
        } else if (bus.loading > busStopTime) {
          bus.loading = 0;
        } else {
          // check if bus needs to stop
          for (let j = 0; j < busStops.length; j++) {
            const stop = busStops[j];
            if (bus.location < stop && stop < newLocation) {
              bus.loading = bus.loading + (Math.random() + 0.1);
              bus.location = stop;
              break; // Break out of loop once we found a stop
            }
          }
        }

        // if bus isn't stopped update location
        if (bus.loading == 0) {
          bus.location = newLocation;
        }
      });

      // update timetable data
      busesTimetable.push(JSON.parse(JSON.stringify(buses)));
      bikesTimetable.push(JSON.parse(JSON.stringify(bikes)));

      // console.log(JSON.stringify(buses));
      // console.log(JSON.stringify(bikes));
    }

    // Fixed average speed calculation
    const calculateAvgSpeed = (data, isbus = false) => {
      if (!data.length) return 0;

      const firstMin = data[0];
      const lastMin = data[data.length - 1];

      // Create maps to easily look up vehicles by ID
      const firstTimeMap = new Map();
      const lastTimeMap = new Map();

      // Populate the maps with the correct ID property
      const idProperty = isbus ? "busID" : "bikeID";

      firstMin.forEach((vehicle) => {
        firstTimeMap.set(vehicle[idProperty], vehicle.location);
      });

      lastMin.forEach((vehicle) => {
        lastTimeMap.set(vehicle[idProperty], vehicle.location);
      });

      // Calculate differences for each vehicle that appears in both time increments
      let totalDifference = 0;
      let vehicleCount = 0;

      // Iterate through all vehicles in the first time increment
      firstTimeMap.forEach((location, vehicleID) => {
        // Check if this vehicle also exists in the last time increment
        if (lastTimeMap.has(vehicleID)) {
          const firstLocation = location;
          const lastLocation = lastTimeMap.get(vehicleID);

          // Calculate difference (distance traveled)
          const difference = lastLocation - firstLocation;

          // Only add positive differences (forward movement)
          if (difference > 0) {
            totalDifference += difference;
            vehicleCount++;
          }
        }
      });

      // Calculate average distance traveled
      const averageDistance =
        vehicleCount > 0 ? totalDifference / vehicleCount : 0;

      // Convert to miles per hour
      // (distance in miles / time in minutes) * 60 minutes per hour
      const averageSpeed = (averageDistance / time) * 60;

      return averageSpeed;
    };

    // adjust count  pose simualtion
    var bikeCount = bikes.length;
    var busCount = buses.length;

    console.log("counts", bikeCount, busCount);

    // Calculate average speeds
    const avgBikeSpeed = calculateAvgSpeed(bikesTimetable);
    const avgBusSpeed = calculateAvgSpeed(busesTimetable, true);

    // Update state with calculated speeds
    setAverageBikeSpeed(avgBikeSpeed);
    setAverageBusSpeed(avgBusSpeed);

    // Transform data for the chart
    const transformedData = busesTimetable.map((timeStep, index) => {
      const dataPoint = { time: index };

      // For busesTimetable
      timeStep.forEach((bus) => {
        dataPoint[`bus${bus.busID}`] = bus.location;
      });

      // For bikesTimetable
      bikesTimetable[index].forEach((bike) => {
        dataPoint[`bike${bike.bikeID}`] = bike.location;
      });

      return dataPoint;
    });

    setChartData(transformedData);
  };

  const handleInputChange = (setter) => (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setter(value);
    }
  };

  return (
    <div>
      <h2>Bus and Bike Simulation</h2>

      <div>
        <div>
          <label>Bus Speed Max (miles)</label>
          <input
            type="number"
            min="1"
            max="60"
            step="1"
            value={busMaxSpeed}
            onChange={handleInputChange(busMaxSpeed)}
          />
        </div>

        <div>
          <label>Bus Stop Frequency (miles)</label>
          <input
            type="number"
            min="0.1"
            max="5"
            step="0.1"
            value={busStopFrequency}
            onChange={handleInputChange(setBusStopFrequency)}
          />
        </div>

        <div>
          <label>Bus Frequency (per hour)</label>
          <input
            type="number"
            min="1"
            max="30"
            step="1"
            value={busFrequency}
            onChange={handleInputChange(setBusFrequency)}
          />
        </div>

        <div>
          <label>Bike Frequency (per hour)</label>
          <input
            type="number"
            min="0"
            max="30"
            step="1"
            value={bikeFrequency}
            onChange={handleInputChange(setBikeFrequency)}
          />
        </div>

        <div>
          <label>Simulation Time (minutes)</label>
          <input
            type="number"
            min="10"
            max="120"
            step="10"
            value={time}
            onChange={handleInputChange(setTime)}
          />
        </div>
      </div>

      <div>
        <div>
          <div>
            <p>Average Bike Speed: {averageBikeSpeed.toFixed(1)} mph</p>
          </div>

          <div>
            <p>Average Bus Speed: {averageBusSpeed.toFixed(1)} mph</p>
          </div>
        </div>
      </div>

      <div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              label={{
                value: "Time (minutes)",
                position: "insideBottom",
                offset: -5,
              }}
            />
            <YAxis
              label={{
                value: "Location (miles)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip />
            {/* <Legend /> */}

            {/* Render Bike Lines */}
            {Array.from({ length: 100 }).map((_, idx) => (
              <Line
                key={`bike${idx + 1}`}
                type="monotone"
                dataKey={`bike${idx + 1}`}
                stroke="#00AA00"
                name={`Bike ${idx + 1}`}
                dot={false}
              />
            ))}

            {/* Render Bus Lines */}
            {Array.from({ length: 100 }).map((_, idx) => (
              <Line
                key={`bus${idx + 1}`}
                type="monotone"
                dataKey={`bus${idx + 1}`}
                stroke="orange"
                name={`Bus ${idx + 1}`}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BusBike;
