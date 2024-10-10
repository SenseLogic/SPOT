![](https://github.com/senselogic/SPOT/blob/master/LOGO/spot.png)

# Spot

GeoIP library.

## Description

**Spot** is a reusable library for GeoIP-based operations, allowing users to determine the geographic location of an IP address.

It provides functionality to handle both IPv4 and IPv6 addresses, with the ability to retrieve location data such as country code, continent code, and time zone.

## Features

- Identifies the country and continent for an IP address (IPv4/IPv6).
- Retrieves latitude and longitude of a country's capital city based on its country code.
- Caches the IP location results for better performance on repeated queries.
- Automatically updates and reads IP range files from remote sources to ensure the latest IP mappings are used.
- Uses an efficient binary search to match IP addresses with geographic data.

## Installation

```bash
npm install senselogic-spot
```

### Usage

```javascript
import { getLocationFromIpAddress } from 'senselogic-spot';

async function getLocation(
    ipAddress
    )
{
    let location = await getLocationFromIpAddress( ipAddress );

    console.log( ipAddress, location );
}

getLocation( '157.164.136.250' );
getLocation( '2a01:690:35:100::f5:79' );
```


### Dependencies

* senselogic-gist

## Version

1.0

## Author

Eric Pelzer (ecstatic.coder@gmail.com).

## License

This project is licensed under the GNU Lesser General Public License version 3.

See the [LICENSE.md](LICENSE.md) file for details.
