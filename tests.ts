// tests go here; this will not be compiled when this package is used as a library
input.onButtonPressed(Button.AB, () => {
    basic.showNumber(weatherbit.soilTemperature())
    serial.writeValue("soil temperature", weatherbit.soilTemperature())
    basic.showNumber(weatherbit.soilMoisture())
    serial.writeValue("soil moisture", weatherbit.soilMoisture())
})
input.onButtonPressed(Button.A, () => {
//    basic.showNumber(weatherbit.temperature()/100)
    serial.writeValue("temperature", weatherbit.temperature()/100)
//    basic.showNumber(weatherbit.humidity()/1024)
    serial.writeValue("humidity", weatherbit.humidity()/1024)
//    basic.showNumber(weatherbit.pressure()/25600)
    serial.writeValue("pressure", weatherbit.pressure()/25600)
//    basic.showNumber(weatherbit.altitude())
//    serial.writeValue("altitude", weatherbit.altitude())
})
input.onButtonPressed(Button.B, () => {
    let dir = weatherbit.windDirection()
    basic.showNumber(weatherbit.windSpeed())
    serial.writeValue("wind speed", weatherbit.windSpeed())
    basic.showNumber(dir)
    basic.showString(weatherbit.directionString(dir))
    basic.showArrow(weatherbit.directionArrowName(dir))
    basic.pause(300)
    basic.showNumber(weatherbit.rain())
    serial.writeValue("rain", weatherbit.rain())
    basic.showNumber(weatherbit.rainRate())
})
input.onLogoEvent(TouchButtonEvent.Pressed, () => {
    basic.showArrow(weatherbit.directionArrowName(0))
})
basic.showNumber(1)
serial.redirect(SerialPin.P15, SerialPin.P14, 115200)
serial.writeValue("Started",0)
basic.showNumber(2)
weatherbit.startRainMonitoring()
weatherbit.startWindMonitoring()
weatherbit.startWeatherMonitoring()

if (weatherbit.windDirection() == 0) {
    serial.writeValue("Simulation started",0)
    weatherbit.simWeather()
}
basic.showNumber(0)
loops.everyInterval(500, () => {
    let dir = weatherbit.windDirection()
    serial.writeValue("D", dir)
    serial.writeLine(weatherbit.directionString(dir))
    basic.showArrow(weatherbit.directionArrowName(dir))
    })