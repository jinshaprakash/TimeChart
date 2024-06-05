
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';


const fetchData = (start, end) => {
    const data = [];
    for (let i = start; i <= end; i++) {
        data.push({ date: new Date(2024, 0, i), value: Math.random() * 100 });
    }
    return data;
};

const TimeSeriesChart = () => {
    const svgRef = useRef();
    const [data, setData] = useState([]);
    const [cache, setCache] = useState({});

    useEffect(() => {
        
        if (!cache['initial']) {
            const initialData = fetchData(1, 30);
            setCache((prevCache) => ({ ...prevCache, 'initial': initialData }));
            setData(initialData);
        } else {
            setData(cache['initial']);
        }
    }, [cache]);

    useEffect(() => {
        if (data.length > 0) {
            drawChart();
        }
    }, [data]);

    const drawChart = () => {
        const svg = d3.select(svgRef.current);
        const width = svg.attr('width');
        const height = svg.attr('height');

        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => d.date))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([height, 0]);

        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg.select('.x-axis').attr('transform', `translate(0, ${height})`).call(xAxis);
        svg.select('.y-axis').call(yAxis);

        const line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX);

        svg.selectAll('.line')
            .data([data])
            .join('path')
            .attr('class', 'line')
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 2);

        
        const zoom = d3.zoom()
            .scaleExtent([1, 10])
            .translateExtent([[-100, -100], [width + 100, height + 100]])
            .on('zoom', (event) => {
                const newXScale = event.transform.rescaleX(xScale);
                const newYScale = event.transform.rescaleY(yScale);

                svg.select('.x-axis').call(d3.axisBottom(newXScale));
                svg.select('.y-axis').call(d3.axisLeft(newYScale));

                svg.selectAll('.line')
                    .attr('d', line.x(d => newXScale(d.date)).y(d => newYScale(d.value)));

               
                const domain = newXScale.domain();
                handlePan(domain);
            });

        svg.call(zoom);
    };

    const handlePan = (domain) => {
        const [start, end] = domain;
        const startKey = start.toISOString().split('T')[0];
        const endKey = end.toISOString().split('T')[0];

        if (!cache[startKey]) {
            const newData = fetchData(start.getDate(), end.getDate());
            setCache((prevCache) => ({ ...prevCache, [startKey]: newData }));
            setData(newData);
        } else {
            setData(cache[startKey]);
        }
    };

    return (
        <svg ref={svgRef} width="800" height="400">
            <g className="x-axis" />
            <g className="y-axis" />
        </svg>
    );
};

export default TimeSeriesChart;
