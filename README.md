Message Counter Node

Counts messages within given interval.

The node has two outputs. <b>Output 1</b> will generate summary message on every interval. <b>Output 2</b> will repeat incoming (non-control) messages. It can be used to continue your flow. 
Messages are counted on regular intervals when a measuring message arrives. You can choose between two types of measuring message generators:

INTERNAL: uses built-in generator. You can specify interval and units (seconds / minutes / hours). Intervals can be aligned to the system clock
EXTERNAL: in this case you are responsible of generating measuring messages. The topic should be "mc-control" and the payload should be "measure".

In case you want information about current message count without resetting the counter, then send message with topic "mc-control" and payload "report". To distinguish between measure and report messages you can use msg.isReset property. This can be useful for displaying message count to a graph.