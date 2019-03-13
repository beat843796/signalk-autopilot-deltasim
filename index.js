/*
 * Copyright 2019 Clemens Hammerl <beat84@me.com>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


module.exports = function(app) {
  const plugin = {}
  
  const start = new Date().getTime()

  var timers = []
  var runnerIndex = 0

  

  plugin.start = function(props) {

    var allAPStates = ["auto", "standby", "alarm", "noDrift", "wind", "depthContour", "route", "directControl"]
    var standardStates = ["auto", "standby", "wind", "route"]



    timers.push(setInterval(() => {

        var state

        if (props.allStates) {
          state = allAPStates[runnerIndex % allAPStates.length]
        }else {
          state = standardStates[runnerIndex % standardStates.length]
        }

        app.handleMessage("apsimulator", createStateDelta(state))

        runnerIndex++

        if (runnerIndex > 10) {
          runnerIndex = 0
        }

      }, props.outputPeriod * 1000))

      timers.push(setInterval(() => {

        app.handleMessage("apsimulator", createTargetDelta(start))

      }, 500))

  }



  plugin.stop = function() {
    timers.forEach(timer => {
      clearInterval(timer)
    })
  }


  plugin.id = "apsimulator"
  plugin.name = "Autopilot state simulator"
  plugin.description = "Plugin that generates different kinds of deltas"


  plugin.schema = {
    "title": "Simulator",
    "type": "object",
    required: [
      "apstate"
    ],
    properties: {
      outputPeriod: {
              type: "number",
              title: "Change period",
              default: 1
            },
        allStates: {
        type: 'boolean',
        title: 'Use all possible states for autopilot. when unchecked just standby, auto, wind and route are used.',
        default: false
      }
    }
  }

  return plugin;
}


function createStateDelta(state)
{

  var delta = {
        updates: [
          {
            "$source": "apsimulator",
            values: [
              {
                path: "steering.autopilot.state",
                value: state
              },
              {
                path: "steering.autopilot.target.windAngleApparent",
                value: 0.0
              },
              {
                path: "steering.autopilot.target.headingTrue",
                value: 0.0
              },
              {
                path: "steering.autopilot.target.headingMagnetic",
                value: 0.0
              }
            ]
          }
        ]
      }

  return delta
}

function createTargetDelta(start)
{
  const hdgTrueMinValue = -1.0
  const hdgTrueMaxValue = 1.0

  const hdgNorthMinValue = -0.8
  const hdgNorthMaxValue = +0.8

  const windMinValue = -0.6
  const windMaxValue = 0.6

  var targetDelta = {
        updates: [
          {
            "$source": "apsimulator",
            values: [
              {
                path: "steering.autopilot.target.windAngleApparent",
                value: windMinValue +
                  Math.abs((((new Date().getTime() - start) / 1000) % 60)/ 60 - 0.5)* 2 * (windMaxValue - windMinValue)
              },
              {
                path: "steering.autopilot.target.headingTrue",
                value: hdgTrueMinValue +
                  Math.abs((((new Date().getTime() - start) / 1000) % 60)/ 60 - 0.5)* 2 * (hdgTrueMaxValue - hdgTrueMinValue)
              },
              {
                path: "steering.autopilot.target.headingMagnetic",
                value: hdgNorthMinValue +
                  Math.abs((((new Date().getTime() - start) / 1000) % 60)/ 60 - 0.5)* 2 * (hdgNorthMaxValue - hdgNorthMinValue)
              }
            ]
          }
        ]
      }

  return targetDelta


}
















