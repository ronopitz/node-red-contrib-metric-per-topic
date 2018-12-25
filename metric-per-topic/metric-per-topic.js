
module.exports = function(RED) {

    function MetricPerTopic(config) {
        console.log('CTOR: MetricPerTopic');
        RED.nodes.createNode(this, config);

        var node = this;
        var ctr = 0;
        var ctrTotal = 0;
        var metric = {};

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
          msg.payload = metric;
          msg.interval = parseInt(node.interval);
          msg.units = node.units;
          msg.generator = node.generator;
          msg.alignToClock = node.alignToClock;
          msg.totalMessageCount = ctrTotal;
          msg.totalMessageInterval = ctr;
          msg.isReset = isReset;

          if (isReset) {
            ctr = 0;
            metric = {};
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

          if (msg.topic == "mpt-control") {
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
            if (msg.topic==undefined) msg.topic="";
            if (metric[msg.topic]==undefined) {
              metric[msg.topic] = {};
              metric[msg.topic].count = 0;
            }
            metric[msg.topic].count++;
            if (isNaN(msg.payload)) {
            } else {
              msg.payload = Number(msg.payload);
              if (metric[msg.topic].sum==undefined) metric[msg.topic].sum = 0;
              if (metric[msg.topic].numcount==undefined) metric[msg.topic].numcount = 0;
              metric[msg.topic].sum += msg.payload;
              metric[msg.topic].numcount++;
              metric[msg.topic].avg = metric[msg.topic].sum / metric[msg.topic].count;
              if (metric[msg.topic].min===undefined) metric[msg.topic].min = msg.payload;
              if (metric[msg.topic].max===undefined) metric[msg.topic].max = msg.payload;
              if (metric[msg.topic].min>msg.payload) metric[msg.topic].min = msg.payload;
              if (metric[msg.topic].max<msg.payload) metric[msg.topic].max = msg.payload;
            }
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

    RED.nodes.registerType("Metric per Topic", MetricPerTopic);
}
