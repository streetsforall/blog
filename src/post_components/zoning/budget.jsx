import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

const CityBudgetChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metricType, setMetricType] = useState('perCapita'); // 'perCapita' or 'perAcre'

  useEffect(() => {
    const processData = async () => {
      try {
        setLoading(true);
        
        // Load the CSV data
        const fileContent = await window.fs.readFile('Normalized City Budgets FiSC  Publci .csv', { encoding: 'utf8' });
        
        // Parse the CSV
        const parsedData = Papa.parse(fileContent, {
          header: false,
          skipEmptyLines: true
        });
        
        const rows = parsedData.data;
        
        // Initialize data structures
        const formattedData = [];
        
        // Process data rows (starting from row 2, which is index 2)
        for (let i = 2; i < rows.length; i++) {
          const row = rows[i];
          
          // Skip if row is empty or invalid
          if (!row || row.length < 12) continue;
          
          const year = row[0];
          
          // Create a data point for each year with both metrics
          const dataPoint = {
            year,
            // Per Capita Budget
            LA_perCapita: parseFloat(row[1].replace(/[^0-9.]/g, '')),
            NYC_perCapita: parseFloat(row[2].replace(/[^0-9.]/g, '')),
            DC_perCapita: parseFloat(row[3].replace(/[^0-9.]/g, '')),
            SF_perCapita: parseFloat(row[4].replace(/[^0-9.]/g, '')),
            Chicago_perCapita: parseFloat(row[5].replace(/[^0-9.]/g, '')),
            
            // Budget/Acre
            LA_perAcre: parseFloat(row[7] || 0),
            NYC_perAcre: parseFloat(row[8] || 0),
            DC_perAcre: parseFloat(row[9] || 0),
            SF_perAcre: parseFloat(row[10] || 0),
            Chicago_perAcre: parseFloat(row[11] || 0)
          };
          
          formattedData.push(dataPoint);
        }
        
        setChartData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error("Error processing data:", err);
        setError("Failed to load data. Please try again.");
        setLoading(false);
      }
    };
    
    processData();
  }, []);

  const handleMetricChange = (e) => {
    setMetricType(e.target.value);
  };

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>{error}</div>;
  if (!chartData || chartData.length === 0) return <div>No data available</div>;

  // Colors for each city
  const cityColors = {
    LA: '#8884d8',
    NYC: '#82ca9d',
    DC: '#ffc658',
    SF: '#0088FE',
    Chicago: '#FF8042'
  };

  return (
    <div>
      <div>
        <label>
          <input
            type="radio"
            value="perCapita"
            checked={metricType === 'perCapita'}
            onChange={handleMetricChange}
          />
          Per Capita Budget
        </label>
        {' '}
        <label>
          <input
            type="radio"
            value="perAcre"
            checked={metricType === 'perAcre'}
            onChange={handleMetricChange}
          />
          Budget per Acre
        </label>
      </div>
      
      <div style={{ width: '100%', height: 500 }}>
        <ResponsiveContainer>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 50, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="year" 
              label={{ value: 'Year', position: 'insideBottomRight', offset: -10 }} 
            />
            <YAxis 
              label={{ 
                value: metricType === 'perCapita' ? 'Dollars ($)' : 'Dollars per Acre ($)', 
                angle: -90, 
                position: 'insideLeft' 
              }} 
            />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Legend />
            
            {/* Dynamic line rendering based on selected metric */}
            {metricType === 'perCapita' ? (
              <>
                <Line type="monotone" dataKey="LA_perCapita" name="LA" stroke={cityColors.LA} />
                <Line type="monotone" dataKey="NYC_perCapita" name="NYC" stroke={cityColors.NYC} />
                <Line type="monotone" dataKey="DC_perCapita" name="DC" stroke={cityColors.DC} />
                <Line type="monotone" dataKey="SF_perCapita" name="SF" stroke={cityColors.SF} />
                <Line type="monotone" dataKey="Chicago_perCapita" name="Chicago" stroke={cityColors.Chicago} />
              </>
            ) : (
              <>
                <Line type="monotone" dataKey="LA_perAcre" name="LA" stroke={cityColors.LA} />
                <Line type="monotone" dataKey="NYC_perAcre" name="NYC" stroke={cityColors.NYC} />
                <Line type="monotone" dataKey="DC_perAcre" name="DC" stroke={cityColors.DC} />
                <Line type="monotone" dataKey="SF_perAcre" name="SF" stroke={cityColors.SF} />
                <Line type="monotone" dataKey="Chicago_perAcre" name="Chicago" stroke={cityColors.Chicago} />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CityBudgetChart;