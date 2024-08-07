var ROOT_PATH = '.';
var app = {};

var chartDom = document.getElementById('main');
var myChart = echarts.init(chartDom);
var option;

$.getJSON(ROOT_PATH + '/hatlar.json', function (ankaraData) {
  let hStep = 300 / (ankaraData.features.length - 1);
  let busLines = ankaraData.features.map(function (feature, idx) {
    if (feature.geometry.type === "LineString") {
      return {
        coords: feature.geometry.coordinates,
        lineStyle: {
          normal: {
            color: echarts.color.modifyHSL('#5A94DF', Math.round(hStep * idx))
          }
        },
        name: feature.properties.name
      };
    }
    return null;
  }).filter(line => line !== null);

  let bounds = [
    [Number.MAX_VALUE, Number.MAX_VALUE],
    [Number.MIN_VALUE, Number.MIN_VALUE]
  ];

  busLines.forEach(line => {
    line.coords.forEach(coord => {
      bounds[0][0] = Math.min(bounds[0][0], coord[0]);
      bounds[0][1] = Math.min(bounds[0][1], coord[1]);
      bounds[1][0] = Math.max(bounds[1][0], coord[0]);
      bounds[1][1] = Math.max(bounds[1][1], coord[1]);
    });
  });

  let center = [
    (bounds[0][0] + bounds[1][0]) / 2 + 0.2,
    (bounds[0][1] + bounds[1][1]) / 2 + 0.18
  ];

  myChart.setOption(
    (option = {
      leaflet: {
        center: center,
        zoom: 11,
        roam: true,
        tiles: [
          {
            urlTemplate: 'https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibXVzdGFmYWthbGthbiIsImEiOiJjbHRmaGxheDgwcG9rMmlxbGF5c3g5dHhqIn0.tX_mOcmBVs6xz7Lp6c0Lqg',
            options: {
              attribution: ''
            }
          }
        ]
      },
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          return 'Hat No: ' + params.data.name;
        }
      },
      series: [
        {
          type: 'lines',
          coordinateSystem: 'leaflet',
          polyline: true,
          data: busLines,
          silent: true,
          lineStyle: {
            opacity: 0.2,
            width: 1
          },
          progressiveThreshold: 500,
          progressive: 200
        },
        {
          type: 'lines',
          coordinateSystem: 'leaflet',
          polyline: true,
          data: busLines,
          lineStyle: {
            width: 0
          },
          effect: {
            constantSpeed: 50,
            show: true,
            trailLength: 0.2,
            symbolSize: 2
          },
          zlevel: 4
        }
      ]
    })
  );
});

option && myChart.setOption(option);

// python -m http.server 8000
