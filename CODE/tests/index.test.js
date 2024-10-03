// -- IMPORTS

import { jest } from '@jest/globals';
import
    {
        getIpAddressInteger,
        getLocationFromIpAddress
    }
    from '../index';

// -- STATEMENTS

jest.setTimeout( 30000 );

describe(
    'base',
    () =>
    {
        test(
            'getLocationFromIpAddress',
            async () =>
            {
                async function testIpAddress(
                    ipAddress,
                    expectedCountryCode
                    )
                {
                    let location = await getLocationFromIpAddress( ipAddress );
                    let ipAddressInteger = getIpAddressInteger( ipAddress );
                    console.log( ipAddress, ipAddressInteger, location );

                    expect( location.countryCode ).toBe( expectedCountryCode );
                }

                await testIpAddress( '157.164.136.250', 'BE' );
                await testIpAddress( '2a01:690:35:100::f5:79', 'BE' );
                await testIpAddress( '195.244.180.40', 'BE' );
                await testIpAddress( '2001:a88:8:10::90', 'GB' );
                await testIpAddress( '52.68.197.172', 'JP' );
                await testIpAddress( '143.92.75.82', 'SG' );
                await testIpAddress( '5.44.65.150', 'NO' );
                await testIpAddress( '200.219.245.230', 'BR' );
            }
            );
    }
    );
