function whole(){
    var main = d3.select("body")
    var scrolly = main.select("#scrolly");
    var figure = scrolly.select("figure");
    var article = scrolly.select("article");
    var stepper = article.selectAll(".stepper");
    const scroller = scrollama();
    var map, albers, height, width, IL, WI, cities, flowLines, path, scale;

    function setupStickyfill() {
        d3.selectAll(".sticky").each(function() {
          Stickyfill.add(this);
        });
      }


    height = screen.height,
    width = screen.width;

    if(width < 576){
        scale = 4000
    }
    else{
        scale = 6400
    }

    albers = d3.geoAlbers()
        .center([-1.4, 39.05])
        .rotate([88, -1, 0])
        .parallels([45, 55.68])
        .scale(scale)
        .translate([width / 2, height / 2]);

    //create new svg container for the map
    map = d3.select("figure.map")
        .append("svg")
        .attr("class","map")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", "100%")


    //call in the projection
    path = d3.geoPath()
        .projection(albers);

    //use Promise.all to parallelize asynchronous data loading
    var promises = [];

    promises.push(d3.json("data/states.topojson"));
    promises.push(d3.json("data/Cities.geojson"));
    promises.push(d3.json("data/flowlines.geojson"))

    Promise.all(promises).then(callback);
    
    function callback(data){
        states = data[0]
        cities = data[1]
        flowLines = data[2]
        console.log(flowLines)
       
        country = topojson.feature(states, states.objects.states).features;
        console.log(country)
        var states_US = map.selectAll(".states")
        .data(country)
        .enter()
        .append("path")
        .attr("class",function(d,i){return "state_"+d.id})
        .attr("d", path)
        .attr("stroke", "#FFFFFF")
        .attr("stroke-width", "0.25px")
        .attr("fill", "none");

        IL =map.selectAll(".state_17")
        .attr("fill","#7aa3f5")
        .attr("fill-opacity","0")

        WI =map.selectAll(".state_55")
        .attr("fill","#7aa3f5")
        .attr("fill-opacity","0")



        setupStickyfill();
        scroller
            .setup({
                step: '#Scrolly article .mapStepper',
                debug: false,
                offset: 0.75
            })
            .onStepEnter(updateMap)
    }
    function updateMap(response){
        d3.selectAll(".paragraphLeft").raise()
        var index = response.index
        if(index == 0){
           IL.transition()
            .duration(1500)
            .attr("fill-opacity","1")

            setTimeout(()=>{plotCity("LZ","yes")},2000)
        }
        if(index == 1){
            map.selectAll(".pulse_LZ").remove();
            plotCity("CHI","no")
        }
        if(index == 2){
            IL.attr("fill-opacity","0.6")
           
            wisconsinAlbers()
            setTimeout(()=>{
                WI.transition()
                .duration(1500)
                .attr("fill-opacity","1")
            },1500)
            setTimeout(()=>{plotCity("SP","yes")},2000)
            setTimeout(()=>{createFlow("LZ_to_SP")},2000)
            
        }
        if(index == 3){
            map.selectAll(".pulse_SP").remove()
            plotCity("MSF","yes")
            setTimeout(()=>{createFlow("SP_to_MSF")},1000)
            lightenFlow(".flow_LZ_to_SP")
        }
        if(index == 4){
            map.selectAll(".pulse_MSF").remove()
            plotCity("APL","yes")
            setTimeout(()=>{createFlow("MSF_to_APL")},1000)
            lightenFlow(".flow_SP_to_MSF")
            
        }
        if(index == 5){
            map.selectAll(".pulse_APL").remove()
            plotCity("MAD","yes")
            setTimeout(()=>{createFlow("APL_to_MAD")},1000)
            lightenFlow(".flow_MSF_to_APL")
            
        }
 
    }
    function plotCity(city, pulse_q){
        var dot = map.selectAll(".city")
            .data(cities.features)
            .enter()
            .append("circle")
            .attr("class","city_"+city)
            .style("fill","#171e2e")
            .attr("cx",function(d){if(d.properties.City == city){
                return albers(d.geometry.coordinates)[0]}})
            .attr("cy",function(d){if(d.properties.City == city)
            {return albers(d.geometry.coordinates)[1]}})
            .transition()
            .delay(function(d,i){ return 300*i })
            .duration(750)
            .attr("r","4.5")
           console.log(city)
        map.append("g")
            .selectAll(".labels")
            .data(cities.features)
            .enter()
            .append("text")
            .attr("class","cityText_"+city)
            .attr("y",function(d){if(d.properties.City == city)
                {if(city == "MAD"){return albers(d.geometry.coordinates)[1]+0}
                if(city == "MSF"){return albers(d.geometry.coordinates)[1]-24}
                else{ return albers(d.geometry.coordinates)[1]-22}};})
            .attr("x",function(d){if(d.properties.City == city)
                {if(city == "MAD"){return albers(d.geometry.coordinates)[0]-65}
                if(city == "MSF"){return albers(d.geometry.coordinates)[0]-85}
                else{return albers(d.geometry.coordinates)[0]+5};}})
            .attr("dy","1em")
            .attr("stroke","none")
            .attr("fill","white")
            .attr("font-weight","600")
            .attr("font-family","'Roboto', sans-serif")
            .text(function(d){if(d.properties.City == city){return d.properties.Fullname}})

        
        if(pulse_q == "yes"){
            map.selectAll('.map')
            .data(cities.features)
            .enter()
            .append("circle")
            .attr("class","pulse_"+city)
            .style("stroke","#171e2e")
            .attr("cx",function(d){if(d.properties.City == city){
                return albers(d.geometry.coordinates)[0]}})
            .attr("cy",function(d){if(d.properties.City == city)
            {return albers(d.geometry.coordinates)[1]}})
            .attr("r","4.5")

            var pulseCircles = map.selectAll('.pulse_'+city)
            pulse(pulseCircles);

            function pulse(pulseCircles) {
                (function repeat() {
                pulseCircles
                    .transition()
                    .duration(500)
                    .attr("stroke-width", 0)
                    .attr('stroke-opacity', 0)
                    .transition()
                    .duration(500)
                    .attr("stroke-width", 0)
                    .attr('stroke-opacity', 0.45)
                    .transition()
                    .duration(1000)
                    .attr("stroke-width", 50)
                    .attr('stroke-opacity', 0)
                    .ease(d3.easePolyInOut)
                    .on("end", repeat);
                })();
            }
        }
        
    }
    function createFlow(flow){
        
        var match, connect;

        for(var i in flowLines){
            if(flowLines[i].flow==flow){
                match = i
            }
        }
        connect = flowLines[match]
        var dest = map.append("path")
            .attr("d",path(connect))
            .attr("class","flow_"+flow)
            .attr("fill","none")
            .attr("stroke","#3150f0")
            .attr("stroke-width",3)
            .lower()

        WI.lower()
        IL.lower()

        var totalLength = dest.node().getTotalLength();

        dest
        .attr("stroke-dasharray", totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(3000)
        .attr("stroke-dashoffset", 0);

        if(flow=="MSF_to_APL"){
            map.selectAll(".flow_MSF_to_APL").raise()
            map.selectAll(".city_APL").raise()
            map.selectAll(".city_MSF").raise()
            map.selectAll(".city_SP").raise()
        }
        if(flow=="APL_to_MAD"){
            map.selectAll(".flow_APL_to_MAD").raise()
            map.selectAll(".city_APL").raise()
            map.selectAll(".city_MAD").raise()
        }
    }
    function lightenFlow(line){
        map.selectAll(line)
            .attr("stroke","#687ff4")

    }
    function wisconsinAlbers(){
        albers.rotate([88, -6, 0]).scale(scale)

        map.selectAll("path")
        .transition()
        .duration(1500)
        .attr("d",path)

        map.selectAll(".city_LZ")
        .transition()
        .duration(1500)
        .attr("cx",function(d){if(d.properties.City == "LZ"){
            return albers(d.geometry.coordinates)[0]}})
        .attr("cy",function(d){if(d.properties.City == "LZ")
        {return albers(d.geometry.coordinates)[1]}})

        map.selectAll(".city_CHI")
        .transition()
        .duration(1500)
        .attr("cx",function(d){if(d.properties.City == "CHI"){
            return albers(d.geometry.coordinates)[0]}})
        .attr("cy",function(d){if(d.properties.City == "CHI")
        {return albers(d.geometry.coordinates)[1]}})

        map.selectAll(".cityText_LZ")
        .transition()
        .duration(1500)
        .attr("x",function(d){if(d.properties.City == "LZ"){
            return albers(d.geometry.coordinates)[0]+5}})
        .attr("y",function(d){if(d.properties.City == "LZ")
        {return albers(d.geometry.coordinates)[1]-22}})

        map.selectAll(".cityText_CHI")
        .transition()
        .duration(1500)
        .attr("x",function(d){if(d.properties.City == "CHI"){
            return albers(d.geometry.coordinates)[0]+5}})
        .attr("y",function(d){if(d.properties.City == "CHI")
        {return albers(d.geometry.coordinates)[1]-22}})

        
    }
    
}
$(document).ready(whole);