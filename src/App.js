import logo from "./logo.svg";
import "./App.css";
import osmtogeojson from "osmtogeojson";
import axios from "axios";
import * as d3 from "d3";
import rewind from "@turf/rewind";

function App() {
  // to be input by user eventually
  const x0 = -75.6968;
  const y0 = 45.4083;
  const x1 = -75.6818;
  const y1 = 45.4204;

  async function mapData() {
    const data = await axios
      .get(
        `https://api.openstreetmap.org/api/0.6/map?bbox=${x0},${y0},${x1},${y1}`
      )
      .then(result => result);

    const osmgeojsondata = data ? osmtogeojson(data.data) : null;

    if (osmgeojsondata) {
      // should be based on page
      const width = 1000;
      const height = 1000;

      const svg = d3
        .select("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .style("max-width", `${width}px`);

      const projection = d3.geoMercator();
      const path = d3.geoPath().projection(projection);

      //need to both reverse and only include the relevant info
      //filtering should be done in initial request, not here!!!
      const filteredMapData = osmgeojsondata.features
        .map(data => rewind(data, { reverse: true }))
        .filter(
          geojson =>
            geojson.id.includes("way") &&
            !geojson.properties.building &&
            !geojson.properties.parking &&
            !geojson.properties.leisure &&
            !geojson.properties.leisure
        );

      projection.fitSize([width, height], {
        type: "FeatureCollection",
        features: filteredMapData
      });

      svg
        .append("g")
        .attr("class", "region")
        .selectAll("path")
        .data(filteredMapData)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "#808A9F")
        .attr("stroke-width", 1.5)
        .attr("fill", "none");
    }
  }

  mapData();

  return <svg />;
}

export default App;
