/**
* Mary West @ SparkFun Electronics 
* Ryan Mortenson https://github.com/ryanjmortenson
* June 13, 2017
* https://github.com/sparkfun/pxt-weather-bit

* Development environment specifics:
* Written in Microsoft PXT
* Tested with a SparkFun weather:bit for micro:bit
*
* This code is released under the [MIT License](http://opensource.org/licenses/MIT).
* Please review the LICENSE.md file included with this example. If you have any questions 
* or concerns with licensing, please contact techsupport@sparkfun.com.
* Distributed as-is; no warranty is given.
*/


/**
 * Functions to operate the weather:bit
 */

//% color=#f44242 icon="\u26C8"
namespace weatherbit {
    // keep track of services
    let rainMonitorStarted = false;
    let windMonitorStarted = false;
    let weatherMonitorStarted = false;
    // Keep Track of weather monitoring variables
    let numRainDumps = 0
    let msRainDump = 0
    let msRainDumpLast = 0
    let numWindTurns = 0
    let numWindTurnsLast = 0
    let msWindTurn = 0
    let msWindTurnLast = 0
    let windMPH = 0
    let directionArrow = [ArrowNames.North,ArrowNames.NorthEast,ArrowNames.East,ArrowNames.SouthEast,ArrowNames.South,ArrowNames.SouthWest,ArrowNames.West,ArrowNames.NorthWest]
    let directionString = ["N","NE","E","SE","S","SW","W","NW"]
    let simDirection = 0 // North - but simulation will override

    // BME280 Addresses
    const bmeAddr = 0x76
    const ctrlHum = 0xF2
    const ctrlMeas = 0xF4
    const config = 0xF5
    const pressMSB = 0xF7
    const pressLSB = 0xF8
    const pressXlsb = 0xF9
    const tempMSB = 0xFA
    const tempLSB = 0xFB
    const tempXlsb = 0xFC
    const humMSB = 0xFD
    const humLSB = 0xFE

    // Stores compensation values for Temperature (must be read from BME280 NVM)
    let digT1Val = 0
    let digT2Val = 0
    let digT3Val = 0

    // Stores compensation values for humidity (must be read from BME280 NVM)
    let digH1Val = 0
    let digH2Val = 0
    let digH3Val = 0
    let digH4Val = 0
    let digH5Val = 0
    let digH6Val = 0

    // Stores compensation values for pressure (must be read from BME280 NVM)
    let digP1Val = 0
    let digP2Val = 0
    let digP3Val = 0
    let digP4Val = 0
    let digP5Val = 0
    let digP6Val = 0
    let digP7Val = 0
    let digP8Val = 0
    let digP9Val = 0

    // BME Compensation Parameter Addresses for Temperature
    const digT1 = 0x88
    const digT2 = 0x8A
    const digT3 = 0x8C

    // BME Compensation Parameter Addresses for Pressure
    const digP1 = 0x8E
    const digP2 = 0x90
    const digP3 = 0x92
    const digP4 = 0x94
    const digP5 = 0x96
    const digP6 = 0x98
    const digP7 = 0x9A
    const digP8 = 0x9C
    const digP9 = 0x9E

    // BME Compensation Parameter Addresses for Humidity
    const digH1 = 0xA1
    const digH2 = 0xE1
    const digH3 = 0xE3
    const e5Reg = 0xE5
    const e4Reg = 0xE4
    const e6Reg = 0xE6
    const digH6 = 0xE7

    // Functions for interfacing with the Weather Meters
    function init(): number {
        pins.digitalWritePin(DigitalPin.P12, 0)
        for (let i = 0; i < 600; i++) {

        }
        pins.digitalWritePin(DigitalPin.P12, 1)
        for (let i = 0; i < 30; i++) {

        }
        let returnValue = pins.digitalReadPin(DigitalPin.P13)
        for (let i = 0; i < 600; i++) {

        }
        return returnValue
    }

    function writeBit(bit: number) {
        let delay1, delay2
        if (bit == 1) {
            delay1 = 1
            delay2 = 80
        }
        else {
            delay1 = 75
            delay2 = 6
        }
        pins.digitalWritePin(DigitalPin.P12, 0)
        for (let i = 0; i < delay1; i++) {

        }
        pins.digitalWritePin(DigitalPin.P12, 1)
        for (let i = 0; i < delay2; i++) {

        }
    }

    function writeByte(byte: number) {
        for (let i = 0; i < 8; i++) {
            if (byte & 1) {
                writeBit(1) //This doesn't seem like it will work at all
            } else {
                writeBit(0)
            }
            byte = byte >> 1
        }
    }

    function readBit(): number {
        pins.digitalWritePin(DigitalPin.P12, 0)
        pins.digitalWritePin(DigitalPin.P12, 1)
        for (let i = 0; i < 20; i++) {

        }
        let returnValue = pins.digitalReadPin(DigitalPin.P13)
        for (let i = 0; i < 60; i++) {

        }
        return returnValue
    }

    function readByte(): number {
        let byte = 0
        for (let i = 0; i < 8; i++) {
            byte |= (readBit() << i);
        }
        return byte;
    }

    function convert(): number {
        writeByte(0x44)
        let j
        for (let i = 0; i < 1000; i++) {
            for (j = 0; j < 900; j++) {

            }
            if (readBit() == 1)
                break;
        }
        return j
    }

    /**
     * returns the correct arrow name for the index supplied
     */
    //% weight=19 
    export function directionArrowName(direction: number): number {
        return directionArrow[Math.round(direction/45)]
    }

    /**
     * returns the correct direction string for the index supplied
     */
    //% weight=18
    export function directionStringName(direction: number): string {
        return directionString[Math.round(direction/45)]
    }

    /**
    * Reads the number of times the rain gauge has filled and emptied
	* Returns 0.1mm of rain. 
    */
    //% weight=34 blockId="weatherbit_rain" block="rain"
    export function rain(): number {
        startRainMonitoring();
        let tenthsOfMmOfRain = ((numRainDumps * 2794) / 1000)
        return tenthsOfMmOfRain
    }
	
    /**
	* Returns the rate of rainfall in 0.1mm/hour based on the last time to fill the bucket
    */
    //% weight=35 blockId="weatherbit_rainRate" block="rain rate"
    export function rainRate(): number {
	startRainMonitoring();
	if (msRainDump == 0)
	    return 0
	else if (control.millis() - msRainDumpLast > msRainDump) // rate estimate decays over time if no more dumps when rain stops
            return 2794 * 3600 / (control.millis() - msRainDumpLast)
	else
            return 2794 * 3600 / msRainDump
    }
	
    /**
    * Sets up an event on pin 2 pulse high and event handler to increment rain
    * numRainDumps on said event.
    */
    //% weight=32 blockGap=8  blockId="weatherbit_startRainMonitoring" block="start rain monitoring"
    export function startRainMonitoring(): void {
        if (rainMonitorStarted) return;

        pins.setPull(DigitalPin.P2, PinPullMode.PullUp)

        // Watch pin 2 for a high pulse and send an event
        pins.onPulsed(DigitalPin.P2, PulseValue.High, () => {
            control.raiseEvent(
                EventBusSource.MICROBIT_ID_IO_P2,
                EventBusValue.MICROBIT_PIN_EVT_RISE
            )
        })

        // Register event handler for a pin 2 high pulse
        control.onEvent(EventBusSource.MICROBIT_ID_IO_P2, EventBusValue.MICROBIT_PIN_EVT_RISE, () => {
            numRainDumps++
            msRainDump = control.millis() - msRainDumpLast
            msRainDumpLast = control.millis()
        })

        // only init once
        rainMonitorStarted = true;
    }

    /**
    * Read the wind direction from the wind vane.  
	* Returns the compass bearing of the wind direction in degrees
    */
    //% weight=20 blockId="weatherbit_windDir" block="wind direction"
    export function windDirection(): number {
        startWindMonitoring();

        let windDir = 0
        windDir = pins.analogReadPin(AnalogPin.P1)
        if (windDir < 906 && windDir > 886)
            return 0
        else if (windDir < 712 && windDir > 692)
            return 45
        else if (windDir < 415 && windDir > 395)
            return 90
        else if (windDir < 498 && windDir > 478)
            return 135
        else if (windDir < 584 && windDir > 564)
            return 180
        else if (windDir < 819 && windDir > 799)
            return 225
        else if (windDir < 988 && windDir > 968)
            return 270
        else if (windDir < 959 && windDir > 939)
            return 315
        else
            return simDirection
    }

    /**
    * Read the instaneous wind speed form the Anemometer. Starting the wind
    * speed monitoring updates the wind in MPH every 2 seconds.
    */
    //% weight=22 blockGap=8 blockId="weatherbit_windSpeed" block="wind speed"
    export function windSpeed(): number {
        startWindMonitoring();

        return windMPH
    }
	
/**
    * Simulate weather - wind and rain
    */
    //% weight=0 blockId="weatherbit_simWeather" block="simulate weather"
    export function simWeather(): void {
        control.inBackground(() => {
            let i = 0
            while (true){
                basic.pause(200)
                numWindTurns++
                msWindTurn = control.millis()
                simDirection = msWindTurn % 360
                i++
                if (i > 7){
                    numRainDumps++
                    msRainDump = control.millis() - msRainDumpLast
                    msRainDumpLast = control.millis()
                    i = 0
                }
            }
        })
	
        return
    }
	
    /**
    * Sets up an event on pin 8 pulse high and event handler to increment
    * numWindTurns on said event.  Starts background service to reset
    * numWindTurns every 2 seconds and calculate MPH.
    */
    //% weight=23 blockGap=8 blockId="weatherbit_startWindMonitoring" block="start wind monitoring"
    export function startWindMonitoring(): void {
        if (windMonitorStarted) return;

        pins.setPull(DigitalPin.P8, PinPullMode.PullUp)

        // Watch pin 8 for a high pulse and send an event
        pins.onPulsed(DigitalPin.P8, PulseValue.High, () => {
            control.raiseEvent(
                EventBusSource.MICROBIT_ID_IO_P8,
                EventBusValue.MICROBIT_PIN_EVT_RISE
            )
        })

        // Register event handler for a pin 8 high pulse
        control.onEvent(EventBusSource.MICROBIT_ID_IO_P8, EventBusValue.MICROBIT_PIN_EVT_RISE, () => {
            numWindTurns++
            msWindTurn = control.millis()
        })

        // Update MPH value every 2 seconds
        control.inBackground(() => {
            while (true) {
                basic.pause(2000)
		        if ((numWindTurns >= numWindTurnsLast) && (msWindTurn > msWindTurnLast)) // take care with wrap-around
                    windMPH = (1000 * (numWindTurns - numWindTurnsLast) / (msWindTurn - msWindTurnLast)) / (1492 / 1000)
                else if (numWindTurns == numWindTurnsLast)
                    // Less than 1 turn in 2s means less than 1mph
                    windMPH = 0
                    
                numWindTurnsLast = numWindTurns
                msWindTurnLast = msWindTurn
            }
        })

        windMonitorStarted = true;
    }

    /***************************************************************************************
     * Functions for interfacing with the BME280
     ***************************************************************************************/

    /**
     * Writes a value to a register on the BME280
     */
    function WriteBMEReg(reg: number, val: number): void {
        pins.i2cWriteNumber(bmeAddr, reg << 8 | val, NumberFormat.Int16BE)
    }

    /**
     * Reads a value from a register on the BME280
     */
    function readBMEReg(reg: number, format: NumberFormat) {
        pins.i2cWriteNumber(bmeAddr, reg, NumberFormat.UInt8LE, false)
        let val = pins.i2cReadNumber(bmeAddr, format, false)
        return val
    }

    /**
     * Reads the temp from the BME sensor and uses compensation for calculator temperature.
     * Returns 4 digit number. Value should be devided by 100 to get DegC
     */
    //% weight=43 blockGap=8 blockId="weatherbit_temperature" block="temperature(C)"
    export function temperature(): number {
        // Read the temperature registers
        let tempRegM = readBMEReg(tempMSB, NumberFormat.UInt16BE)
        let tempRegL = readBMEReg(tempXlsb, NumberFormat.UInt8LE)

        // Use compensation formula and return result
        return compensateTemp((tempRegM << 4) | (tempRegL >> 4))
    }

    /**
     * Reads the humidity from the BME sensor and uses compensation for calculating humidity.
     * returns a 5 digit number. Value should be divided by 1024 to get % relative humidity. 
     */
    //% weight=41 blockGap=8 blockId="weatherbit_humidity" block="humidity"
    export function humidity(): number {
        // Read the pressure registers
        let humReg = readBMEReg(humMSB, NumberFormat.UInt16BE)

        // Compensate and return humidity
        return compensateHumidity(humReg)
    }

    /**
     * Reads the pressure from the BME sensor and uses compensation for calculating pressure.
     * Returns an 8 digit number. Value should be divided by 25600 to get hPa. 
     */
    //% weight=42 blockGap=8 blockId="pressure" block="pressure"
    export function pressure(): number {
        // Read the temperature to set tfine for the pressure compensation
        let temp = temperature()

        // Read the pressure registers
        let pressRegM = readBMEReg(pressMSB, NumberFormat.UInt16BE)
        let pressRegL = readBMEReg(pressXlsb, NumberFormat.UInt8LE)

        // Compensate and return pressure
        return compensatePressure((pressRegM << 4) | (pressRegL >> 4), tFine)
    }

    /**
     * Sets up BME for in Weather Monitoring Mode.
     */
    //% weight=44 blockGap=8 blockId="weatherbit_setupBME280" block="start weather monitoring"
    export function startWeatherMonitoring(): void {
        if (weatherMonitorStarted) return;

        // The 0xE5 register is 8 bits where 4 bits go to one value and 4 bits go to another
        let e5Val = 0

        // Set up the BME in weather monitoring mode
        WriteBMEReg(ctrlHum, 0x01) //oversample humidty x1
        WriteBMEReg(ctrlMeas, 0x27) // oversample pressure x1; oversample temperature x1; Normal mode
        WriteBMEReg(config, 0) //t_sb=0; filter=0; spi3wire=0

        // Get the NVM digital compensations numbers from the device for temp
        digT1Val = readBMEReg(digT1, NumberFormat.UInt16LE)
        digT2Val = readBMEReg(digT2, NumberFormat.Int16LE)
        digT3Val = readBMEReg(digT3, NumberFormat.Int16LE)

        // Get the NVM digital compensation number from the device for pressure and pack into
        // a buffer to pass to the C++ implementation of the compensation formula
        digP1Val = readBMEReg(digP1, NumberFormat.UInt16LE)
        digP2Val = readBMEReg(digP2, NumberFormat.Int16LE)
        digP3Val = readBMEReg(digP3, NumberFormat.Int16LE)
        digP4Val = readBMEReg(digP4, NumberFormat.Int16LE)
        digP5Val = readBMEReg(digP5, NumberFormat.Int16LE)
        digP6Val = readBMEReg(digP6, NumberFormat.Int16LE)
        digP7Val = readBMEReg(digP7, NumberFormat.Int16LE)
        digP8Val = readBMEReg(digP8, NumberFormat.Int16LE)
        digP9Val = readBMEReg(digP9, NumberFormat.Int16LE)

        // Get the NVM digital compensation number from device for humidity
        e5Val = readBMEReg(e5Reg, NumberFormat.Int8LE)
        digH1Val = readBMEReg(digH1, NumberFormat.UInt8LE)
        digH2Val = readBMEReg(digH2, NumberFormat.Int16LE)
        digH3Val = readBMEReg(digH3, NumberFormat.UInt8LE)
        digH4Val = (readBMEReg(e4Reg, NumberFormat.Int8LE) << 4) | (e5Val & 0xf)
        digH5Val = (readBMEReg(e6Reg, NumberFormat.Int8LE) << 4) | (e5Val >> 4)
        digH6Val = readBMEReg(digH6, NumberFormat.Int8LE)

        weatherMonitorStarted = true;
    }

    // Global variable used in all calculations for the BME280
    let tFine = 0

    /**
     * Returns temperature in DegC, resolution is 0.01 DegC. Output value of "5123" equals 51.23 DegC.
     * tFine carries fine temperature as global value
     */
    function compensateTemp(tempRegVal: number): number {
        let firstConv: number = (((tempRegVal >> 3) - (digT1Val << 1)) * digT2Val) >> 11
        let secConv: number = (((((tempRegVal >> 4) - digT1Val) * ((tempRegVal >> 4) - (digT1Val))) >> 12) * (digT3Val)) >> 14
        tFine = firstConv + secConv
        return (tFine * 5 + 128) >> 8
    }

    /**
     * Returns humidity in %RH as unsigned 32 bit integer in Q22.10 format (22 integer and 10 fractional bits).
     * Output value of "47445" represents 47445/1024 = 46.333 %RH
     */
    function compensateHumidity(humRegValue: number): number {
        let hum: number = (tFine - 76800)
        hum = (((((humRegValue << 14) - (digH4Val << 20) - (digH5Val * hum)) + 16384) >> 15) * (((((((hum * digH6Val) >> 10) * (((hum * digH3Val) >> 11) + 32768)) >> 10) + 2097152) * digH2Val + 8192) >> 14))
        hum = hum - (((((hum >> 15) * (hum >> 15)) >> 7) * digH1Val) >> 4)
        hum = (hum < 0 ? 0 : hum)
        hum = (hum > 419430400 ? 419430400 : hum)
        return (hum >> 12)
    }

    /**
     * Function used has to be in floating point to work properly
     * The return value is in pseudo-24.8 integer format as Pa, so divide by 256 to get Pa
     * and by 25600 to get the normal hPa units (aka millibar)
     */
    //%
    function compensatePressure(pressRegVal: number, tFine: number) {

        let firstConv: number = tFine/2.0 - 64000.0;
        let secondConv: number = firstConv * firstConv * (digP6Val/32768.0);
        secondConv += firstConv * digP5Val * 2.0;
        secondConv = (secondConv / 4.0) + (digP4Val * 65536.0);
        let var3 = digP3Val * firstConv*firstConv / 524228.0
        firstConv = (var3 + digP2Val*firstConv) / 524228.0;
        firstConv = (1.0 + firstConv/32768.0) * digP1Val;
        if (firstConv == 0) {
            return 0; //avoid exception caused by divide by 0
        }
        let pressureReturn = 1048576.0 - pressRegVal;
        pressureReturn = (pressureReturn - (secondConv/4096.0)) * 6250.0 / firstConv;

        let var1 = digP9Val * pressureReturn * pressureReturn / 2147483648.0
        let var2 = (pressureReturn * digP8Val) / 32768.0;
        //256 * bigger than the normal floating point return value to keep the same units as the more normal 64 and 32 bit implementations
        pressureReturn = 256.0 * pressureReturn + 16.0 * (var1 + var2 + digP7Val); 
        return pressureReturn;
    }

    /**
   * Reads the pressure from the BME sensor and uses compensation for calculating pressure.
   * Returns altitude in meters based on pressure at sea level. (absolute altitude)
   */
    //% weight=40 blockGap=28 blockId="weatherbit_altitude" block="altitude(M)"
    export function altitude(): number {
        startWeatherMonitoring();

        let pressRegM = readBMEReg(pressMSB, NumberFormat.UInt16BE)
        let pressRegL = readBMEReg(pressXlsb, NumberFormat.UInt8LE)
        return calcAltitude((pressRegM << 4) | (pressRegL >> 4), tFine)
    }

    /** 
     * Function used for simulator, actual implementation is in weatherbit.cpp
     */
    //%
    function calcAltitude(pressRegVal: number, tFine: number): number {
        let returnValue = compensatePressure(pressRegVal, tFine);
        returnValue /= 25600.0;
        returnValue /= 1013.25;
        returnValue = returnValue ** 0.1903;
        returnValue = 1 - returnValue;
        returnValue *= 44330;
        return returnValue;
    }


    // Functions for interfacing with the soil moisture and soil temperature (aquaponics)


    /**
     * Reads the Moisture Level from the Soil Moisture Sensor.
	 * Returns a value between 0 and 1023. 0 being dry and 1023 being wet.     
     */
    //% weight=11 blockGap=8 blockId="weatherbit_soilMoisture" block="soil moisture"
    export function soilMoisture(): number {
        let soilMoisture = 0
        pins.digitalWritePin(DigitalPin.P16, 1)
        basic.pause(10)
        soilMoisture = pins.analogReadPin(AnalogPin.P0)
        basic.pause(1000)
        pins.digitalWritePin(DigitalPin.P16, 0)
        return soilMoisture
    }
    /**
     * Reads the temperature from the one-wire temperature sensor.
	 * Returns a 4 digit number. value should be divided by 100 to get 
	 * temperature in hundreths of a degree centigrade. 
     */
    //% weight=10 blockId="weatherbit_soilTemp" block="soil temperature(C)"
    //%
    export function soilTemperature(): number {
        init();
        writeByte(0xCC);
        convert();
        init();
        writeByte(0xCC);
        writeByte(0xBE);
        let soilTempLSB = readByte();
        let soilTempMSB = readByte();
        let temp = ((soilTempMSB << 8) | soilTempLSB);
        temp *= (100 / 16);
        return temp;
    }
}
