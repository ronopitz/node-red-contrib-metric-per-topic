**Metric per Topic Node**

Count and calculate the payload metric per topic within given interval.

**Output**

The node has two outputs.

- *Output 1* will generate summary message on every interval.  The payload is an object with the min, max, avg, sum and count per topic.
- *Output 2* will repeat incoming (non-control) messages. It can be used to continue your flow.

**Intervals**

Messages are counted on regular intervals when a measuring message arrives. You can choose between two types of measuring message generators:

INTERNAL: uses built-in generator. You can specify interval and units (seconds / minutes / hours). Intervals can be aligned to the system clock
EXTERNAL: in this case you are responsible of generating measuring messages. The topic should be "mc-control" and the payload should be "measure".

**Input**

- *Payload*

  If the payload is numeric the node calculate the metric per topic. Otherwise the node only count the messages per topic.

- *Control the node*

  In case you want information about current message count without resetting the counter, then send message with topic "mc-control" and payload "report". To distinguish between measure and report messages you can use msg.isReset property. This can be useful for displaying message count to a graph.

**ToDo**

- additional number of payloads if the node has received mixed payloads (number/text)
