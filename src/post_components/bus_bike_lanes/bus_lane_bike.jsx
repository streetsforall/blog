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
  // const [busSpeedAvg, setBusSpeedAvg] = useState(25);

  // how many minutes to simulate
  var time = 60;

  // miles per hour
  var busMaxSpeed = 25;
  var bikeMaxSpeed = 12;

  // frequency per minute
  var busFrequency = 3;
  var bikeFrequency = 12;

  // miles
  var busStopFrequency = 1;

  // average time of stop
  var busStopTime = .5;

  // road distance mi
  var distance = 12;

  // data arrays
  const busesTimetable = [];
  const bikesTimetable = [];
  const bikes = [];
  const buses = [];

  const busStops = Array.from({ length: 100 }, (_, i) => i * busStopFrequency);

  console.log("busStops", busStops);

  // SPAWN BUSES
  for (let i = 1; i <= distance * 2; i++) {
    // Create bus with explicit number (not variable)
    var new_bus = {
      busID: i,
      location: (i * distance) / busFrequency,
      speed: busMaxSpeed,
      loading: 0,
    };

    buses.push(new_bus);
  }

  if (bikeFrequency > 0) {
      // SPAWN BIKES
  for (let i = 1; i <= distance * 2; i++) {
    var bike = {
      bikeID: i,
      location: (i * distance) / bikeFrequency,
      speed: bikeMaxSpeed,
    };
    bikes.push(bike);
  }

  }


  // increment every minute
  var i = 0;
  while (i < time) {
    i += 1;

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

          // 50% odds of passing bike in given minute
          if (Math.random() < 0.75) {
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
        // this is a non performant way to loop, should break our of loop as soon as it is true
        busStops.forEach((stop) => {
          if (bus.location < stop && stop < newLocation) {
            console.log("bus_" + bus.busID + " stopping at bus stop " + stop);
            bus.loading = bus.loading + (Math.random() + 0.1);
            bus.location = stop;
          }
        });
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

  const calaculateAvgSpeed = (data) => {
    const firstMin = data[0];
    const lastMin = data[data.length - 1];

    // Create maps to easily look up bikes by ID
    const firstTimeMap = new Map();
    const lastTimeMap = new Map();

    // Populate the maps
    firstMin.forEach((vehicle) => {
      firstTimeMap.set(vehicle.bikeID, vehicle.location);
    });

    lastMin.forEach((vehicle) => {
      lastTimeMap.set(vehicle.bikeID, vehicle.location);
    });

    // Calculate differences for each bike that appears in both time increments
    let totalDifference = 0;
    let vehicleCount = 0;

    // Iterate through all bikeIDs in the first time increment
    firstTimeMap.forEach((location, busID) => {
      // Check if this bike also exists in the last time increment
      if (lastTimeMap.has(busID)) {
        const firstLocation = location;
        const lastLocation = lastTimeMap.get(busID);

        console.log("locations", firstLocation, lastLocation);

        // Calculate absolute difference
        const difference = Math.abs(lastLocation - firstLocation);
        console.log("difference", difference);

        totalDifference += difference;
        vehicleCount++;
      }
    });

  var average = vehicleCount > 0 ? totalDifference / vehicleCount : 0;
   var  averagespeed = (average / time) * 60
    console.log("average", averagespeed);

    return average;
  };

  console.log("bikes");
  const averageBike = calaculateAvgSpeed(bikesTimetable);
  console.log("buses", busesTimetable);
  const averageBus = calaculateAvgSpeed(busesTimetable);

  // setBusSpeedAvg(averageBus);

  console.log("bikesTimetable", bikesTimetable);

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

  return (
    <div>
      <div>
        <p>
          {"Average Bike Speed: " +
            ((averageBike / time) * 60).toFixed(1) +
            "mph"}
        </p>

        <p>
          {"Average Bus Speed: " + (averageBus).toFixed(1) + "mph"}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={transformedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          {/* <Legend /> */}

          {/* Render Bike Lines */}
          {Array.from({ length: bikeFrequency }).map((_, idx) => (
            <Line
              key={`bike${idx + 1}`}
              type="monotone"
              dataKey={`bike${idx + 1}`}
              stroke={`#00FF00`}
            />
          ))}

          {/* Render Bus Lines */}
          {Array.from({ length: busFrequency }).map((_, idx) => (
            <Line
              key={`bus${idx + 1}`}
              type="monotone"
              dataKey={`bus${idx + 1}`}
              stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BusBike;
