// -- IMPORTS

import fs from 'fs';
import https from 'https';
import path from 'path';
import
    {
        getCapitalLatitudeFromCountryCode,
        getCapitalLongitudeFromCountryCode,
        getContinentCodeFromCountryCode,
        getContinentSlugFromContinentCode,
        getTimeZoneFromLocation,
        CappedMap
    }
    from 'senselogic-gist';

// -- VARIABLES

export let
    cachedIpAddressCount = 200,
    ipRangeArrayFolderPath = './',
    ipv4RangeFileName = 'geolite2-geo-whois-asn-country-ipv4-num.csv',
    ipv4RangeFileUrl = 'https://cdn.jsdelivr.net/npm/@ip-location-db/geolite2-geo-whois-asn-country/geolite2-geo-whois-asn-country-ipv4-num.csv',
    ipv4RangeArray = [],
    ipv4RangeArrayTimestamp = null,
    ipv6RangeFileName = 'geolite2-geo-whois-asn-country-ipv6-num.csv',
    ipv6RangeFileUrl = 'https://cdn.jsdelivr.net/npm/@ip-location-db/geolite2-geo-whois-asn-country/geolite2-geo-whois-asn-country-ipv6-num.csv',
    ipv6RangeArray = [],
    ipv6RangeArrayTimestamp = null,
    locationByIpAddressCappedMap = null,
    updateMillisecondCount = 2 * 24 * 3600000;

// -- FUNCTIONS

export function isIpv4Address(
    ipAddress
    )
{
    return ipAddress.indexOf( '.' ) > 0;
}

// ~~

export function isIpv6Address(
    ipAddress
    )
{
    return ipAddress.indexOf( ':' ) > 0;
}

// ~~

export function getIpv4AddressInteger(
    ipAddress
    )
{
    let partArray = ipAddress.split( '.' );

    if ( partArray.length === 4 )
    {
        return (
            ( ( partArray[ 0 ] << 24 ) >>> 0 )
            + ( ( partArray[ 1 ] << 16 ) >>> 0 )
            + ( ( partArray[ 2 ] << 8 ) >>> 0 )
            + ( partArray[ 3 ] >>> 0 )
            );
    }
    else
    {
        return 0;
    }
}

// ~~

export function getIpv6AddressInteger(
    ipAddress
    )
{
    let bigInt = BigInt( 0 );
    let partArray = ipAddress.split( ':' );

    if ( partArray.length < 8 )
    {
        let emptyPartIndex = partArray.indexOf( '' );

        if ( emptyPartIndex >= 0 )
        {
            partArray[ emptyPartIndex ] = '0';

            while ( partArray.length < 8 )
            {
                partArray.splice( emptyPartIndex, 0, '0' );
            }
        }
    }

    if ( partArray.length === 8 )
    {
        for ( let partIndex = 0;
              partIndex < 8;
              ++partIndex )
        {
            bigInt = ( bigInt << 16n ) + BigInt( parseInt( partArray[ partIndex ], 16 ) );
        }
    }

    return bigInt;
}

// ~~

export function getIpAddressInteger(
    ipAddress
    )
{
    if ( isIpv4Address( ipAddress ) )
    {
        return getIpv4AddressInteger( ipAddress );
    }
    else if ( isIpv6Address( ipAddress ) )
    {
        return getIpv6AddressInteger( ipAddress );
    }
    else
    {
        return '';
    }
}

// ~~

export function getFileTimestamp(
    filePath
    )
{
    if ( fs.existsSync( filePath ) )
    {
        return new Date( fs.statSync( filePath ).mtime );
    }
    else
    {
        return new Date( 0 );
    }
}

// ~~

export async function updateFile(
    fileUrl,
    filePath
    )
{
    let currentDate = new Date();

    if ( currentDate - getFileTimestamp( filePath ) > updateMillisecondCount )
    {
        console.log( `Updating ${ filePath }` );

        return (
            new Promise(
                ( resolve, reject ) =>
                {
                    let file = fs.createWriteStream( filePath );

                    https.get(
                        fileUrl,
                        ( response ) =>
                        {
                            response.pipe(file);

                            file.on(
                                'finish',
                                () => file.close( resolve )
                                );
                        }
                        ).on(
                            'error',
                            async ( downloadError ) =>
                            {
                                try
                                {
                                    await fs.promises.unlink( filePath );
                                }
                                catch ( unlinkError )
                                {
                                    reject( unlinkError );
                                }

                                reject( downloadError );
                            }
                            );
                }
                )
            );
    }
    else
    {
        console.log( `Keeping ${ filePath }` );
    }
}

// ~~

export async function readIpv4RangeFile(
    filePath
    )
{
    console.log( `Reading ${ filePath }` );

    let fileText = await fs.promises.readFile( filePath, 'utf8' );
    let lineArray = fileText.replaceAll( '\r', '' ).split('\n');
    ipv4RangeArray = [];

    for ( let line of lineArray )
    {
        if ( line.length > 0 )
        {
            let partArray = line.split( ',' );

            ipv4RangeArray.push(
                {
                    firstIpAddressInteger : parseInt( partArray[ 0 ] ),
                    lastIpAddressInteger : parseInt( partArray[ 1 ] ),
                    countryCode : partArray[ 2 ]
                }
                );
        }
    }

    ipv4RangeArrayTimestamp = new Date();
}

// ~~

export async function readIpv6RangeFile(
    filePath
    )
{
    console.log( `Reading ${ filePath }` );

    let fileText = await fs.promises.readFile( filePath, 'utf8' );
    let lineArray = fileText.replaceAll( '\r', '' ).split('\n');
    ipv6RangeArray = [];

    for ( let line of lineArray )
    {
        if ( line.length > 0 )
        {
            let partArray = line.split( ',' );

            ipv6RangeArray.push(
                {
                    firstIpAddressInteger : BigInt( partArray[ 0 ] ),
                    lastIpAddressInteger : BigInt( partArray[ 1 ] ),
                    countryCode : partArray[ 2 ]
                }
                );
        }
    }

    ipv6RangeArrayTimestamp = new Date();
}

// ~~

export function getCountryCodeFromIpAddressInteger(
    ipAddressInteger,
    ipRangeArray
    )
{
    let firstIpRangeIndex = 0;
    let lastIpRangeIndex = ipRangeArray.length - 1;

    while ( firstIpRangeIndex <= lastIpRangeIndex )
    {
        let middleIpRangeIndex = ( firstIpRangeIndex + lastIpRangeIndex ) >> 1;
        let middleIpRange = ipRangeArray[ middleIpRangeIndex ];

        if ( ipAddressInteger >= middleIpRange.firstIpAddressInteger
             && ipAddressInteger <= middleIpRange.lastIpAddressInteger )
        {
            return middleIpRange.countryCode;
        }
        else if ( ipAddressInteger < middleIpRange.firstIpAddressInteger )
        {
            lastIpRangeIndex = middleIpRangeIndex - 1;
        }
        else
        {
            firstIpRangeIndex = middleIpRangeIndex + 1;
        }
    }

    console.log( 'IP not found : ', ipAddressInteger );

    return '';
}

// ~~

export async function getCountryCodeFromIpAddress(
    ipAddress
    )
{
    let currentDate = new Date();

    if ( isIpv4Address( ipAddress ) )
    {
        let ipv4AddressInteger = getIpv4AddressInteger( ipAddress );
        let ipv4RangeFilePath = path.resolve( ipRangeArrayFolderPath, ipv4RangeFileName );

        if ( ipv4RangeArray.length === 0
             || currentDate - ipv4RangeArrayTimestamp > updateMillisecondCount )
        {
            await updateFile( ipv4RangeFileUrl, ipv4RangeFilePath );
            await readIpv4RangeFile( ipv4RangeFilePath );
        }

        return getCountryCodeFromIpAddressInteger( ipv4AddressInteger, ipv4RangeArray );
    }
    else if ( isIpv6Address( ipAddress ) )
    {
        let ipv6AddressInteger = getIpv6AddressInteger( ipAddress );
        let ipv6RangeFilePath = path.resolve( ipRangeArrayFolderPath, ipv6RangeFileName );

        if ( ipv6RangeArray.length === 0
             || currentDate - ipv6RangeArrayTimestamp > updateMillisecondCount )
        {
            await updateFile( ipv6RangeFileUrl, ipv6RangeFilePath );
            await readIpv6RangeFile( ipv6RangeFilePath );
        }

        return getCountryCodeFromIpAddressInteger( ipv6AddressInteger, ipv6RangeArray );
    }
    else
    {
        console.error( 'Invalid IP address format: ' + ipAddress );

        return '';
    }
}

// ~~

export async function getLocationFromIpAddress(
    ipAddress
    )
{
    if ( locationByIpAddressCappedMap === null )
    {
        locationByIpAddressCappedMap = new CappedMap( cachedIpAddressCount );
    }

    let location = locationByIpAddressCappedMap.get( ipAddress );

    if ( location === undefined )
    {
        location =
            {
                countryCode : '',
                continentCode : '',
                continentSlug : '',
                latitude : 0.0,
                longitude : 0.0,
                timeZone : '',
                isFound : false,
                isAntarctica : false,
                isSouthAmerica : false,
                isCentralAmerica : false,
                isNorthAmerica : false,
                isAmerica : false,
                isAfrica : false,
                isEurope : false,
                isOceania : false,
                isAsia : false,
                isJapan : false
            };

        location.countryCode = await getCountryCodeFromIpAddress( ipAddress );

        if ( location.countryCode !== '' )
        {
            location.continentCode = getContinentCodeFromCountryCode( location.countryCode );
            location.continentSlug = getContinentSlugFromContinentCode( location.continentCode );
            location.latitude = getCapitalLatitudeFromCountryCode( location.countryCode );
            location.longitude = getCapitalLongitudeFromCountryCode( location.countryCode );
            location.timeZone = getTimeZoneFromLocation( location.latitude, location.longitude, location.countryCode );
            location.isFound = true;
            location.isAntarctica = ( location.continentCode === 'AN' );
            location.isSouthAmerica = ( location.continentCode === 'SA' );
            location.isCentralAmerica = ( location.continentCode === 'CA' );
            location.isNorthAmerica = ( location.continentCode === 'NA' );
            location.isAmerica = ( location.isSouthAmerica || location.isCentralAmerica || location.isNorthAmerica );
            location.isAfrica = ( location.continentCode === 'AF' );
            location.isEurope = ( location.continentCode === 'EU' );
            location.isOceania = ( location.continentCode === 'OC' );
            location.isAsia = ( location.continentCode === 'AS' );
            location.isJapan = ( location.countryCode === 'JP' );

            locationByIpAddressCappedMap.set( ipAddress, location );
        }
    }

    return location;
}
