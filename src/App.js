import logo from "./logo.svg";
import "./App.css";
import osmtogeojson from "osmtogeojson";
import axios from "axios";
import * as d3 from "d3";
import rewind from "@turf/rewind";

function App() {
  const x0 = -75.6968;
  const y0 = 45.4083;
  const x1 = -75.6818;
  const y1 = 45.4204;

  async function test() {
    const data = await axios
      .get(
        `https://api.openstreetmap.org/api/0.6/map?bbox=${x0},${y0},${x1},${y1}`
      )
      .then(result => result);
    // .then(({ request: { responseXML } }) => responseXML);

    // console.log({ data });

    const osmgeojsondata = data ? osmtogeojson(data.data) : null;

    console.log({ osmgeojsondata });

    if (osmgeojsondata) {
      var width = 1000,
        height = 1000;

      var svg = d3
        .select("body")
        .append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .style("max-width", `${width}px`);

      var projection = d3.geoMercator();
      var path = d3.geoPath().projection(projection);

      console.log(osmgeojsondata);

      //need to both reverse and only include the relevant info
      //filtering should be done in initial request, not here!!!
      var fixed = osmgeojsondata.features
        .map(function(f) {
          return rewind(f, { reverse: true });
        })
        .filter(
          x =>
            x.id.includes("way") &&
            !x.properties.building &&
            !x.properties.parking &&
            !x.properties.leisure &&
            !x.properties.leisure
        );

      console.log(fixed);

      projection.fitSize([width, height], {
        type: "FeatureCollection",
        features: fixed
      });

      svg
        .append("g")
        .attr("class", "region")
        .selectAll("path")
        .data(fixed)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "#808A9F")
        .attr("stroke-width", 1.5)
        .attr("fill", "none");
    }
  }

  test();

  return <div />;
}

export default App;
