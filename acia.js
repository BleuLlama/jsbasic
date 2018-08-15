// ACIA handler
//	v1.0  2018-08 Scott Lawrence - yorgle@gmail.com
//
//	simulates the bare minimum to be a Super Serial card.
//	SuperSerial uses a 6551 chip with 4 registers:
//
//	The card i've implemented sits in slot 2
//	READ $C088+slot(2) = 49320
//
//		name		real address	decimal address for slot 2
//		data    equ $C088+slot		49320
//		status  equ $C089+slot		49321
//		command equ $C08A+slot		49322
//		control equ $C08B+slot		49323
//
//	so peek at 49320 will get you the data received from the external device.
//	for the implementation in this file, the four registers are determined 
//	by address 0,1,2,3.  the translation happens inside the basic.js file.
//
//	For this implementation, command and control (2,3) are essentially ignored.
//	Writes to them are ignored, and reads from them return canned values.
// 
//	Writes to status(1) are also ignored. Reads will tell you only if there
//	is a character available in the 1 byte buffer.
//
//	On real hardware, there are various error bits, interrupt bits,
//	etc.  but for our uses, we only care about value $08 (b00001000),
//	which is set if there's a byte in the buffer, cleared if it's not
//	reads from data(0) from the computer side will get the data, 
//	which clears the buffer and clears this bit.
//
//	Writes from the computer will call ACIA_CharacterToDevice, and on 
//	to the device's handler.  In the future this should be a callback.
//


var ACIA_Buffer = undefined;

// ACIA_SendFromDevice
//		called by the device to send data in to our computer
//		should be an array of characters to FIFO in/out, but
//		for my project, this is sufficient.
function ACIA_SendFromDevice( character )
{
	console.log( "RX from device: " + character );
	ACIA_Buffer = character;
}


// ACIA_Peek
//		called when PEEK is called on one of our addresses
function ACIA_Peek( address )
{
	//console.log( "ACIA_Peek " + address + "   " + ACIA_Buffer );

	if( address == 0 ) {
		if( ACIA_Buffer == null ) {
			return 0;
		}

		// data
		var t = ACIA_Buffer;
		ACIA_Buffer = null;
		return t.charCodeAt( 0 );
	}

	// fakeo stuff.
	if( address == 1 ) { 
		var retval = 0;
		// Status: character available
		if( ACIA_Buffer == null ) { retval = 0; }
		else { retval = 8; }

		return retval;
	}  

	if( address == 2 ) { return 11; } // Command
	if( address == 3 ) { return 28; } // Control

	return 0;
}

// ACIA_Poke
//		called when POKE is called to one of our registers
function ACIA_Poke( address, data )
{
  if( address == 0 ) {
  	ACIA_CharacterToDevice( data );
  }

  if( address == 1 ) { /* console.log( 'ACIA Poke Status: ' + data );  */ }
  if( address == 2 ) { /* console.log( 'ACIA Poke Command: ' + data ); */ }
  if( address == 3 ) { /* console.log( 'ACIA Poke Control: ' + data ); */ }
}

// ACIA_CharacterToDevice
//		called when data is received
//		in the future, this should be a callback.
function ACIA_CharacterToDevice( ch )
{
	if (typeof VDP_HandleSerialByte !== "undefined") { 
		VDP_HandleSerialByte( ch );
	} else {
		console.log( "Send serial byte to device: " + ch );
	}
}

