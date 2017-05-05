
module.exports = function(RED) {
 
    function MessageCounterNode(config) {
        console.log('CTOR: MessageCounterNode');
        RED.nodes.createNode(this, config);     
        
        var node = this;
        var ctr = 0;
        var ctrTotal = 0;
        
        node.status({ }); 
        node.units = config.units;
        node.interval = config.interval;
        node.alignToClock = config.alignToClock;
        node.generator = config.generator;
        
        console.log("INFO! " + node.interval + " | " + node.units + " | " + node.alignToClock);
        
        function measure(isReset) {
          
          console.log(new Date());
          console.log("INFO: " + node.interval + " | " + node.units + " | " + node.alignToClock);
          
          msg = {};
          msg.payload = ctr;
          msg.interval = parseInt(node.interval);
          msg.units = node.units;
          msg.generator = node.generator;
          msg.alignToClock = node.alignToClock;
          msg.totalMessageCount = ctrTotal;
          msg.isReset = isReset;
          
          if (isReset) {
            ctr = 0;
          };
          
          node.send([msg, null]);
          showCount();
          
        }
        
        function getRemainingMs(units, interval) {
          
          var now = new Date();
          
          switch (units) {
            case "seconds": {  
              return interval * 1000 - now.getMilliseconds();  
            }; break;
            
            case "minutes": { 
              return ( interval * 60 - now.getSeconds()) * 1000 - now.getMilliseconds();  
            }; break;
            
            case "hours": {  
              return (interval * 3600 - now.getSeconds()) * 1000 - now.getMilliseconds();  
            }; break;
          };
          
        }
        
        function intervalToMs(units, interval) {
          
          switch (units) {
            case "seconds": {  
              return interval * 1000;  
            }; break;
            
            case "minutes": { 
              return interval * 60 * 1000;  
            }; break;
            
            case "hours": {  
              return interval * 3600 * 1000;  
            }; break;
          };
          
        }
        
        function runClock() {        
        
            var timeToNextTick = getRemainingMs(node.units, node.interval);           
            console.log("timeToNextTick: " + timeToNextTick);
            
            return setTimeout(function() {
                measure(true);
                node.internalTimer = runClock();
            }, timeToNextTick);
        }
        
        function startGenerator() {
          
          if (node.generator != "internal")
            return;
          
          if (node.alignToClock) {
            node.internalTimer = runClock();
          } else {
            var interval = intervalToMs(node.units, node.interval);
            console.log("Interval: " + interval);
            node.internalTimer = setInterval(measure, interval);
          };
          
        }
        
        function stopGenerator() {
          
          if (node.generator != "internal")
            return;
          
            if (node.alignToClock) {
              clearTimeout(node.internalTimer);
            } else {
              clearInterval(node.internalTimer);
            };
            
        }
        
        function showCount() {
          node.status({ fill: "green", shape: "dot", text: ctr });
        };
        
        showCount();
        startGenerator();
        
        this.on('input', function(msg) {
          
          if (msg.topic == "mc-control") {
            // This is a control message
            switch (msg.payload) {
              case "measure": {
                measure(true);
                
              }; break;
              
              case "report": {
                measure(false);
                
              }; break;
              
              default: {
                node.status({ fill: "red", shape: "dot", text: "Invalid control command: " + msg.payload });
              }
            }
            
          } else {
            // Count messages
            ctr++;
            ctrTotal++;
            showCount();
            node.send([null, msg]);            
          }

          
        });
        
        this.on('close', function() {
          // tidy up any state
          console.log("CLEANUP");
          stopGenerator();
        });
    }
    
    RED.nodes.registerType("Message Counter", MessageCounterNode);
}