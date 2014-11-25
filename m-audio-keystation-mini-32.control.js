loadAPI(1);

host.defineController("M-Audio", "Keystation Mini 32", "1.0", "69cb6728-002b-4546-b9a9-6ffb19d58281");
host.defineMidiPorts(1, 0);
host.addDeviceNameBasedDiscoveryPair(["Keystation Mini 32"], ["Keystation Mini 32"]);

var LOWEST_CC = 1;
var HIGHEST_CC = 119;

// Volume knob defaults to CC 07
var DEVICE_START_CC = 7;
var DEVICE_END_CC = 8;

function init()
{
	host.getMidiInPort(0).setMidiCallback(onMidi);
  generic = host.getMidiInPort(0).createNoteInput("Keystation Mini 32", "??????");
  generic.setShouldConsumeEvents(false);

	// Map CC 20 - 27 to device parameters

	cursorDevice = host.createCursorDeviceSection(8);
	cursorTrack = host.createCursorTrackSection(3, 0);
	primaryInstrument = cursorTrack.getPrimaryInstrument();

	for ( var i = 0; i < 8; i++)
	{
		var p = primaryInstrument.getMacro(i).getAmount();
		p.setIndication(true);
	}

	// Make the rest freely mappable
	userControls = host.createUserControlsSection(HIGHEST_CC - LOWEST_CC + 1 - 8);

	for ( var i = LOWEST_CC; i < HIGHEST_CC; i++)
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
	return cc >= DEVICE_START_CC && cc <= DEVICE_END_CC;
}

function userIndexFromCC(cc)
{
	if (cc > DEVICE_END_CC)
	{
		return cc - LOWEST_CC - 8;
	}

	return cc - LOWEST_CC;
}

function onMidi(status, data1, data2)
{
	if (isChannelController(status))
	{
		if (isInDeviceParametersRange(data1))
		{
			var index = data1 - DEVICE_START_CC;
			primaryInstrument.getMacro(index).getAmount().set(data2, 128);
		}
		else if (data1 >= LOWEST_CC && data1 <= HIGHEST_CC)
		{
			var index = data1 - LOWEST_CC;
			userControls.getControl(index).set(data2, 128);
		}
	}
}

function exit()
{
}
