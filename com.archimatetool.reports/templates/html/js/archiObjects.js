var archiObjects = {
  strategy:['resource','capability','course-of-action','value-stream'],
  business:['business-actor','business-role','business-collaboration','business-interface','business-process','business-interaction','business-event','business-object','contract','representation','product'],
  application:['application-component','application-collaboration','application-interface','application-function','application-process','application-interaction','application-event','application-service','data-object'],
  technology:['node','device','system-software','technology-collaboration','technology-interface','path','communication-network','technology-function','technology-process','technology-interaction','technology-event','technology-service','artifact'],
  physical:['equipment','facility','distribution-network','material'],
  motivation:['stakeholder','driver','assessment','goal','outcome','principle','requirement','constraint','meaning','value'],
  implementation:['work-package','deliverable','implementation-event','plateau','gap'],
  other:['location','grouping','junction'],
  relationships:['composition-relationship','aggregation-relationship','assignment-relationship','realization-relationship','serving-relationship','access-relationship','influence-relationship','triggering-relationship','flow-relationship','specialization-relationship','association-relationship'],
  visual:['diagram-model-note','diagram-model-group','diagram-model-connection','diagram-model-image','diagram-model-reference','sketch-model-sticky','sketch-model-actor','canvas-model-block','cavnas-model-stick','canvas-model-image'],
  view:['archimate-diagram-model','sketch-model','canvas-model']
}

var relationshipVerb = {
	'access-relationship':['accesses','reads','writes','reads/writes'],
	'aggregation-relationship':['aggregates','aggregated by'],
	'assignment-relationship':['assigned to','assigned from'],
	'association-relationship':['associated to','associated from'],
	'composition-relationship':['composed of','part of'],
	'flow-relationship':['flows to','flows from'],
	'influence-relationship':['influences','influenced by'],
	'realization-relationship':['realizes','realized by'],
	'serving-relationship':['serves','served by'],
	'triggering-relationship':['triggers','triggered by'],
	'specialization-relationship':['specializes','specialization of']
}

var relationshipFriction = {
	'composition-relationship':9,
	'aggregation-relationship':9,
	'assignment-relationship':4,
	'realization-relationship':9,
	'serving-relationship':3,
	'access-relationship':2,
	'influence-relationship':5,
	'triggering-relationship':2,
	'flow-relationship':1,
	'specialization-relationship':9,
	'association-relationship':4
}
