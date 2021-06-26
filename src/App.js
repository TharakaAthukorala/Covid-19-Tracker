import React, {useState, useEffect} from "react";
import { MenuItem, FormControl, Select } from "@material-ui/core";
import './App.css';
import InfoBox from './InfoBox';
import Map from './Map';
import { Card, CardContent, Typography } from "@material-ui/core";
import Table from './Table';
import LineGraph from './LineGraph';
import { sortData, prettyPrintStat } from './sortValue';
import numeral from "numeral";
import "leaflet/dist/leaflet.css";

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 7.8731, lng: 80.7718 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all").then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    })
    
  }, [])

  //The code will run once when the component loads and not again
  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries") //get contries from this link
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ));

        const sortedData = sortData(data);

        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries); 
      });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    // console.log(countryCode);
    setCountry(countryCode);

    const url = countryCode === "worldwide" ? "https://disease.sh/v3/covid-19/all" : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url).then(response => response.json()).then(data => {
      setCountry(countryCode);
      setCountryInfo(data);

      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    })
  };

  console.log(countryInfo);

  return (
    <div className="app">
      <div className="left">
  
      <div className="app_header">      
      <h1>Covid 19 Tracker</h1>
      <FormControl className="app_dropdown">
        <Select variant="outlined" onChange={onCountryChange} value={country}>

          <MenuItem value="worldwide">Worldwide</MenuItem>
          {countries.map(country => ( <MenuItem value={country.value}>{country.name}</MenuItem> ))}

          {/* <MenuItem value="worldwide">Worldwide</MenuItem>
          <MenuItem value="worldwide">Option</MenuItem>
          <MenuItem value="worldwide">Worldwide</MenuItem>
          <MenuItem value="worldwide">Worldwide</MenuItem> */}
        </Select>
      </FormControl>
      </div>

      <div className="app_status">
          <InfoBox 
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <InfoBox 
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            // isGreen
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <InfoBox 
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
      </div>

      <Map 
        countries={mapCountries}
        casesType={casesType} 
        center={mapCenter} 
        zoom={mapZoom} />

    </div>
    
      <Card className="right">
          <CardContent>
            <h3>Live cases by country</h3>
            <Table countries={tableData}></Table>
            <h3>Worldwide new Cases</h3>

            <LineGraph casesType={casesType} />

          </CardContent>
      </Card>
    </div>
  );
}

export default App;
