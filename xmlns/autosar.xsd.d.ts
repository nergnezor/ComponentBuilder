import * as Primitive from './xml-primitives';

// Source files:
// http://bitbucket.neonode.local/projects/NSFW/repos/rte_generator/raw/autosar.xsd


interface BaseType {
	_exists: boolean;
	_namespace: string;
}
interface _ClientPortsType extends BaseType {
	client_port?: ClientPortsTypeClient_portType[];
}
export interface ClientPortsType extends _ClientPortsType { constructor: { new(): ClientPortsType }; }
export var ClientPortsType: { new(): ClientPortsType };

interface _ClientPortsTypeClient_portType extends BaseType {
	/** Specifies the number of ports if the port is a port-array */
	array_size: number;
	/** If generate_ports is true, this marks and exception for this port. */
	exclude_port: boolean;
	/** The name of the port instance, to be referenced by connections. */
	name: string;
	/** A reference to a port definition that identifies the function signature. For port generation, the operation names will be used to format the names. */
	port_definition: string;
}
interface ClientPortsTypeClient_portType extends _ClientPortsTypeClient_portType { constructor: { new(): ClientPortsTypeClient_portType }; }

interface _ComponentInstancesType extends BaseType {
	/** A component instance that exists on this ECU. */
	component?: ComponentInstancesTypeComponentType[];
}
export interface ComponentInstancesType extends _ComponentInstancesType { constructor: { new(): ComponentInstancesType }; }
export var ComponentInstancesType: { new(): ComponentInstancesType };

interface _ComponentInstancesTypeComponentType extends BaseType {
	/** The name of the component. Must exist in the components element. */
	component: string;
	/** An arbitary ID for the component. This ID is only used when calling into user code to fetch the instance pointer, and is there to support multi-instance components and contexts. */
	instance_id: number;
}
interface ComponentInstancesTypeComponentType extends _ComponentInstancesTypeComponentType { constructor: { new(): ComponentInstancesTypeComponentType }; }

interface _ComponentsType extends BaseType {
	/** If true, generates port according to the port mapping element.Even if ports are not generated, functions for read and writing inputs and outputs will still be generated, and can be used explicitly. */
	generate_ports: boolean;
	/** A software component (SW-C) that defines inputs, outputs, and runnables. */
	component?: ComponentsTypeComponentType[];
}
export interface ComponentsType extends _ComponentsType { constructor: { new(): ComponentsType }; }
export var ComponentsType: { new(): ComponentsType };

interface _ComponentsTypeComponentType extends BaseType {
	/** The name of the software component. For port generation, should comply to the SW-C output name in snake_case. */
	name: string;
}
interface ComponentsTypeComponentType extends _ComponentsTypeComponentType { constructor: { new(): ComponentsTypeComponentType }; }

interface _ConnectionsType extends BaseType {
	/** A connection between and output and an input. */
	connection?: ConnectionsTypeConnectionType[];
}
export interface ConnectionsType extends _ConnectionsType { constructor: { new(): ConnectionsType }; }
export var ConnectionsType: { new(): ConnectionsType };

interface _ConnectionsTypeConnectionType extends BaseType {
	/** The input of the connection. The name is specified as component:input:index, where index only is used if the input is a port array. Input may be a server port. */
	input: string;
	/** The output of the connection. The name is specified as component:output:index, where index only is used if the output is a port array. Output may be a client port. */
	output: string;
	/** Number of elements the queue can hold. Required if queue is true. */
	queue_length: number;
	/** If true, means the connected output and input can be written/read from different threads. */
	thread_safe: boolean;
	/** If defined, does not allocate memory for the cahced input but uses an extern field defined by the user. Usable for sharing memory between ports to reduce total memory footprint. */
	user_defined_cached_input_holder: string;
	/** If defined, does not allocate memory for the cahced output but uses an extern field defined by the user. Usable for sharing memory between ports to reduce total memory footprint. */
	user_defined_cached_output_holder: string;
	/** If defined, does not allocate memory for the input but uses an extern field defined by the user. Usable for sharing memory between ports to reduce total memory footprint. */
	user_defined_input_holder: string;
}
interface ConnectionsTypeConnectionType extends _ConnectionsTypeConnectionType { constructor: { new(): ConnectionsTypeConnectionType }; }

interface _EcusType extends BaseType {
	/** An ecu definition. Currently only supports one ECU. */
	ecu?: EcusTypeEcuType[];
}
export interface EcusType extends _EcusType { constructor: { new(): EcusType }; }
export var EcusType: { new(): EcusType };

interface _EcusTypeEcuType extends BaseType {
	name: string;
	components?: ComponentInstancesType;
	tasks?: TasksType;
}
interface EcusTypeEcuType extends _EcusTypeEcuType { constructor: { new(): EcusTypeEcuType }; }

interface _EventsType extends BaseType {}
export interface EventsType extends _EventsType { constructor: { new(): EventsType }; }
export var EventsType: { new(): EventsType };

interface _InitsType extends BaseType {
	/** Init functions that should be called during the startup of this task. */
	init?: InitsTypeInitType[];
}
export interface InitsType extends _InitsType { constructor: { new(): InitsType }; }
export var InitsType: { new(): InitsType };

interface _InitsTypeInitType extends BaseType {
	/** The runnable to call. Should be on the format component:runnable. */
	runnable: string;
}
interface InitsTypeInitType extends _InitsTypeInitType { constructor: { new(): InitsTypeInitType }; }

interface _InputsType extends BaseType {
	input?: InputsTypeInputType[];
}
export interface InputsType extends _InputsType { constructor: { new(): InputsType }; }
export var InputsType: { new(): InputsType };

interface _InputsTypeInputType extends BaseType {
	/** Specifies the number of ports if the port is a port-array */
	array_size: number;
	/** If generate_ports is true, this marks and exception for this input. Useful if the port needs some extra non-standard parameters. */
	exclude_port: boolean;
	/** If true, an implicit read call will be generated. Doubles the memory usage as a cached copy of the input is needed. */
	i_read: boolean;
	/** The name of the input. For port generation, should comply to the SW-C input name in snake_case. */
	name: string;
	/** If true, the input uses queue semantics. */
	queued: boolean;
	/** The C type of the input. The type must be found in one of the include files specified during generation. */
	type: string;
}
interface InputsTypeInputType extends _InputsTypeInputType { constructor: { new(): InputsTypeInputType }; }

interface _OutputsType extends BaseType {
	/** An output from the SW-C. */
	output?: OutputsTypeOutputType[];
}
export interface OutputsType extends _OutputsType { constructor: { new(): OutputsType }; }
export var OutputsType: { new(): OutputsType };

interface _OutputsTypeOutputType extends BaseType {
	/** Specifies the number of ports if the port is a port-array */
	array_size: number;
	/** If generate_ports is true, this marks and exception for this output. Useful if the port needs some extra non-standard parameters. */
	exclude_port: boolean;
	/** If true, an implicit write call will be generated. Doubles the memory usage as a cached copy of the output is needed. */
	i_write: boolean;
	/** The name of the output. For port generation, should comply to the SW-C output name in snake_case. */
	name: string;
	/** Specifies if the port uses queue semantics. */
	queued: boolean;
	/** The C type of the output. The type must be found in one of the include files specified during generation. */
	type: string;
}
interface OutputsTypeOutputType extends _OutputsTypeOutputType { constructor: { new(): OutputsTypeOutputType }; }

interface _ParametersType extends BaseType {
	/** A parameter getter. */
	parameter?: ParametersTypeParameterType[];
}
export interface ParametersType extends _ParametersType { constructor: { new(): ParametersType }; }
export var ParametersType: { new(): ParametersType };

interface _ParametersTypeParameterType extends BaseType {
	/** If generate_ports is true, this marks and exception for this parameter. Useful if the port needs some extra non-standard parameters. */
	exclude_port: boolean;
	/** The name of the parameter. */
	name: string;
	/** The type of the parameter. Will always be const and passed by reference, if not a basic type. */
	type: string;
}
interface ParametersTypeParameterType extends _ParametersTypeParameterType { constructor: { new(): ParametersTypeParameterType }; }

interface _PerInstanceMemoriesType extends BaseType {
	/** A PIM getter. */
	per_instance_memory?: PerInstanceMemoriesTypePer_instance_memoryType[];
}
export interface PerInstanceMemoriesType extends _PerInstanceMemoriesType { constructor: { new(): PerInstanceMemoriesType }; }
export var PerInstanceMemoriesType: { new(): PerInstanceMemoriesType };

interface _PerInstanceMemoriesTypePer_instance_memoryType extends BaseType {
	/** If generate_ports is true, this marks and exception for this PIM. Useful if the port needs some extra non-standard parameters. */
	exclude_port: boolean;
	/** The name of the PIM. */
	name: string;
	/** The type of the PIM. Will always be passed by reference, if not a basic type. */
	type: string;
}
interface PerInstanceMemoriesTypePer_instance_memoryType extends _PerInstanceMemoriesTypePer_instance_memoryType { constructor: { new(): PerInstanceMemoriesTypePer_instance_memoryType }; }

/** A collection of all port definitions. */
interface _PortDefinitionsType extends BaseType {
	port_definition?: PortDefinitionsTypePort_definitionType[];
}
export interface PortDefinitionsType extends _PortDefinitionsType { constructor: { new(): PortDefinitionsType }; }
export var PortDefinitionsType: { new(): PortDefinitionsType };

/** A port definition describes a set of operations that can be called via a client port. They are referenced from the components. */
interface _PortDefinitionsTypePort_definitionType extends BaseType {
	/** The name of the port definition, to be referenced from client ports. */
	name: string;
	operations: PortDefinitionsTypePort_definitionTypeOperationsType;
}
interface PortDefinitionsTypePort_definitionType extends _PortDefinitionsTypePort_definitionType { constructor: { new(): PortDefinitionsTypePort_definitionType }; }

interface _PortDefinitionsTypePort_definitionTypeOperationsType extends BaseType {
	operation: PortDefinitionsTypePort_definitionTypeOperationsTypeOperationType[];
}
interface PortDefinitionsTypePort_definitionTypeOperationsType extends _PortDefinitionsTypePort_definitionTypeOperationsType { constructor: { new(): PortDefinitionsTypePort_definitionTypeOperationsType }; }

/** An operation corresponds to a server function that can be called by a client port. */
interface _PortDefinitionsTypePort_definitionTypeOperationsTypeOperationType extends BaseType {
	/** The name of the operation */
	name: string;
	/** Specifeis the parameter list. */
	parameters: string;
	/** Specifies the return type. */
	returns: string;
}
interface PortDefinitionsTypePort_definitionTypeOperationsTypeOperationType extends _PortDefinitionsTypePort_definitionTypeOperationsTypeOperationType { constructor: { new(): PortDefinitionsTypePort_definitionTypeOperationsTypeOperationType }; }

/** The port mappings describes how the ports should be generated. A scheme can be specified so that the generated function signatures matched the SW-Cs signatures. */
interface _PortMappingsType extends BaseType {
	/** Type of the instance that is the first argument to all functions. Usually some derivate of void*. */
	instance_type: string;
	/** The return type from the functions. The return codes should be of this type. */
	return_type: string;
	/** The signature of the port function to generate. Supports the tokens [ns], [comp], [calltype] and [port].ns is the namespace, comp is the component name, calltype is for example i_write, read etc, and port is the name of the port.Using an uppercase letter like [Ns] means name is converted from snake_case to camelCase. The string also supports underscores.Example: "[ns][Comp]_[Calltype]_[Port]" would generate names like "zfaScanner_IWriteRef_Signals". */
	signature: string;
	return_codes?: PortMappingsTypeReturn_codesType;
}
export interface PortMappingsType extends _PortMappingsType { constructor: { new(): PortMappingsType }; }
export var PortMappingsType: { new(): PortMappingsType };

/** Contains return code mappings between the built-in rte_status code and the SW-C error codes. At a minimum, the following conversions should exist: rte_status_success, rte_status_generic_error, rte_status_timeout */
interface _PortMappingsTypeReturn_codesType extends BaseType {
	return_code?: PortMappingsTypeReturn_codesTypeReturn_codeType[];
}
interface PortMappingsTypeReturn_codesType extends _PortMappingsTypeReturn_codesType { constructor: { new(): PortMappingsTypeReturn_codesType }; }

/** A return code value mapping. */
interface _PortMappingsTypeReturn_codesTypeReturn_codeType extends BaseType {
	/** The built-in rte status code to translate. */
	rte_type: string;
	/** The native status code to translate into */
	type: string;
}
interface PortMappingsTypeReturn_codesTypeReturn_codeType extends _PortMappingsTypeReturn_codesTypeReturn_codeType { constructor: { new(): PortMappingsTypeReturn_codesTypeReturn_codeType }; }

interface _RteType extends BaseType {}
export interface RteType extends _RteType { constructor: { new(): RteType }; }
export var RteType: { new(): RteType };

interface _RunnablesType extends BaseType {
	/** A runnable function. Normally has the signature void myRunnable(void *instance); */
	runnable?: RunnablesTypeRunnableType[];
}
export interface RunnablesType extends _RunnablesType { constructor: { new(): RunnablesType }; }
export var RunnablesType: { new(): RunnablesType };

interface _RunnablesTypeRunnableType extends BaseType {
	/** The corresponding C function to call. */
	function: string;
	/** The name of the runnable. */
	name: string;
}
interface RunnablesTypeRunnableType extends _RunnablesTypeRunnableType { constructor: { new(): RunnablesTypeRunnableType }; }

interface _RuntimeType extends BaseType {
	ecus: EcusType;
}
export interface RuntimeType extends _RuntimeType { constructor: { new(): RuntimeType }; }
export var RuntimeType: { new(): RuntimeType };

interface _ServerPortsType extends BaseType {
	server_port?: ServerPortsTypeServer_portType[];
}
export interface ServerPortsType extends _ServerPortsType { constructor: { new(): ServerPortsType }; }
export var ServerPortsType: { new(): ServerPortsType };

interface _ServerPortsTypeServer_portType extends BaseType {
	/** The name of the port instance, to be referenced by connections. */
	name: string;
	/** A reference to a port definition that identifies the function signature */
	port_definition: string;
}
interface ServerPortsTypeServer_portType extends _ServerPortsTypeServer_portType { constructor: { new(): ServerPortsTypeServer_portType }; }

interface _TasksType extends BaseType {
	/** A task that runs on the ECU. Exactly how tasks are implemented depends on the OS used. */
	task?: TasksTypeTaskType[];
}
export interface TasksType extends _TasksType { constructor: { new(): TasksType }; }
export var TasksType: { new(): TasksType };

interface _TasksTypeTaskType extends BaseType {
	/** Name of the task, for identification purposes. */
	name: string;
	/** A priorty integer. The interpretation depends on the OS. */
	priority: number;
	/** The stack size in bytes. */
	stack_size: number;
}
interface TasksTypeTaskType extends _TasksTypeTaskType { constructor: { new(): TasksTypeTaskType }; }

interface _TimedEventsType extends BaseType {
	/** A timer that triggers a runnable at a periodic interval. */
	timed_event?: TimedEventsTypeTimed_eventType[];
}
export interface TimedEventsType extends _TimedEventsType { constructor: { new(): TimedEventsType }; }
export var TimedEventsType: { new(): TimedEventsType };

interface _TimedEventsTypeTimed_eventType extends BaseType {
	/** The name of the event. */
	name: string;
	/** The period of the timer in milliseconds. */
	period_ms: number;
	/** The runnable to call. Should be on the format component:runnable. */
	runnable: string;
}
interface TimedEventsTypeTimed_eventType extends _TimedEventsTypeTimed_eventType { constructor: { new(): TimedEventsTypeTimed_eventType }; }

interface _TriggeredEventsType extends BaseType {
	/** A trigger that runs a runnable when an input or custom trigger is written. */
	triggered_event?: TriggeredEventsTypeTriggered_eventType[];
}
export interface TriggeredEventsType extends _TriggeredEventsType { constructor: { new(): TriggeredEventsType }; }
export var TriggeredEventsType: { new(): TriggeredEventsType };

interface _TriggeredEventsTypeTriggered_eventType extends BaseType {
	/** If set, specifies an external trigger instead of an input trigger. A function to check if the trigger is set needs to be implemented by the user, with the correct signature. */
	custom_trigger_func: string;
	/** The input to trigger on. The format is component:input. */
	input: string;
	/** The name of the event. */
	name: string;
	/** The runnable to call. Should be on the format component:runnable. */
	runnable: string;
}
interface TriggeredEventsTypeTriggered_eventType extends _TriggeredEventsTypeTriggered_eventType { constructor: { new(): TriggeredEventsTypeTriggered_eventType }; }

export interface document extends BaseType {
	rte: RteType;
}
export var document: document;
