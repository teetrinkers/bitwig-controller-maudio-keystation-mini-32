loadAPI(1);

host.defineController("M-Audio", "Keystation Mini 32", "1.0", "69cb6728-002b-4546-b9a9-6ffb19d58281");
host.defineMidiPorts(1, 0);
host.addDeviceNameBasedDiscoveryPair(["Keystation Mini 32"], ["Keystation Mini 32"]);

var CC_MIN = 1;
var CC_MAX = 119;

// Volume knob defaults to CC 07.
var DEVICE_MACRO_COUNT = 1
var DEVICE_CC_START = 7;
var DEVICE_CC_END = 7;

function init()
{
	host.getMidiInPort(0).setMidiCallback(onMidi);
    noteInput = host.getMidiInPort(0).createNoteInput("Keystation Mini 32");
    noteInput.setShouldConsumeEvents(false);

	// Init device macros.
	cursorTrack = host.createCursorTrack(3, 0);
	primaryDevice = cursorTrack.getPrimaryDevice();
	for (var i = 0; i < DEVICE_MACRO_COUNT; i++)
	{
		var p = primaryDevice.getMacro(i).getAmount();
		p.setIndication(true);
	}

    // Init user controls.
	userControls = host.createUserControls(CC_MAX - CC_MIN + 1 - DEVICE_MACRO_COUNT);
	for (var i = CC_MIN; i < CC_MAX; i++)
	{
		if (!isInDeviceParametersRange(i))
		{
			var index = userIndexFromCC(i);
			userControls.getControl(index).setLabel("CC" + i);
		}
	}
}

function isInDeviceParametersRange(cc)
{
	return withinRange(cc, DEVICE_CC_START, DEVICE_CC_END);
}

function userIndexFromCC(cc)
{
	if (cc > DEVICE_CC_END)
	{
		return cc - CC_MIN - DEVICE_MACRO_COUNT;
	}

	return cc - CC_MIN;
}

function onMidi(status, data1, data2)
{
	if (isChannelController(status))
	{
		if (isInDeviceParametersRange(data1))
		{
			var index = data1 - DEVICE_CC_START;
			primaryDevice.getMacro(index).getAmount().set(data2, 128);
		}
		else if (withinRange(data1, CC_MIN, CC_MAX))
		{
			var index = data1 - CC_MIN;
			userControls.getControl(index).set(data2, 128);
		}
	}
}

function exit()
{
}
