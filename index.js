/*
 * Copyright 2016 Teppo Kurki <teppo.kurki@iki.fi>
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

const debug = require('debug')('simulator')


module.exports = function(app) {
  const plugin = {}
  var timers = []
  var apstate

  plugin.start = function(props) {


  apstate = props.apstate


    var delta = {
        updates: [
          {
            "$source": "apsimulator." + i,
            values: [
              {
                path: "steering.autopilot.state",
                value: apstate
              }
            ]
          }
        ]
      }

    timers.push(setInterval(() => {
        app.handleMessage("apsimulator", delta
      }, props.outputPeriod * 1000 || 1000))



  }



  plugin.stop = function() {
    timers.forEach(timer => {
      clearInterval(timer)
    })
  }


  plugin.id = "apsimulator"
  plugin.name = "Signal K delta simulator"
  plugin.description = "Plugin that generates different kinds of deltas"


  plugin.schema = {
    "title": "Simulator",
    "type": "object",
    required: [
      "apstate"
    ],
    properties: {
      apstate: {
        type: "string",
        title: "Autopilot N2K Device ID ",
        default: "204"
      },
      outputPeriod: {
              type: "number",
              title: "Output period (s)",
              default: 2
            }
    }
  }

  return plugin;
}




