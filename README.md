**Metric per Topic Node**

Count and calculate the payload metric per topic within given interval.

**Input**

- *Payload*

  If the payload is numeric the node calculate the metric per topic. Otherwise the node only count the messages per topic.

- *Control the node*

  In case you want information about current message count without resetting the counter, then send message with topic "mpt-control" and payload "report". To distinguish between measure and report messages you can use msg.isReset property. This can be useful for displaying message count to a graph.

**Output**

The node has two outputs.

- *Output 1* will generate summary message on every interval.  The payload is an object with the min, max, avg, sum and count per topic.
- *Output 2* will repeat incoming (non-control) messages. It can be used to continue your flow.

Outputschema

    {
      "payload": {
        "<topicname1>": {
          "count": 3,
          "sum": 8,
          "numcount": 2,
          "avg": 4,
          "min": 3,
          "max": 5
        },
        "<topicname2>": {
          "count": 4
        },
        ...
      },
      "totalMessageCount": 39,
      "totalMessageInterval": 15,
    }

Field | Description
---|---
count | Count of all messages with the same topic
numcount | Count of all messages with numeric payload with the same topic

**Intervals**

Messages are counted on regular intervals when a measuring message arrives. You can choose between two types of measuring message generators:

INTERNAL: uses built-in generator. You can specify interval and units (seconds / minutes / hours). Intervals can be aligned to the system clock
EXTERNAL: in this case you are responsible of generating measuring messages. The topic should be "mpt-control" and the payload should be "measure".
