// -- CONSTANTS

const 
    arraySize = 100000;

// -- FUNCTIONS

function getAllocatedByteCount(
    )
{
    return process.memoryUsage().heapUsed;
}

// ~~

function getNumberArray(
    )
{
    let numberArray = new Array( arraySize ).fill( 0 );

    for ( let i = 0; i < arraySize; i++ )
    {
        numberArray[ i ] = 0x0FFFFFFF;
    }

    return numberArray;
}

// ~~

function getBigIntArray(
    )
{
    let bigIntArray = new Array( arraySize ).fill( 0n );

    for ( let i = 0; i < arraySize; i++ )
    {
        bigIntArray[ i ] = BigInt( 0x0FFFFFFFFFFFFFFF );
    }

    return bigIntArray;
}

// ~~

function getTupleArray(
    )
{
    let tupleArray = new Array( arraySize ).fill( 0n );

    for ( let i = 0; i < arraySize; i++ )
    {
        tupleArray[ i ] = { low: 0x0FFFFFFF, high: 0x0FFFFFFF };
    }

    return tupleArray;
}

// -- STATEMENTS

let allocatedByteCount = getAllocatedByteCount();
let numberArray = getNumberArray();
let numberArrayByteCount = getAllocatedByteCount() - allocatedByteCount;
numberArray.length = 0;

allocatedByteCount = getAllocatedByteCount();
let bigIntArray = getBigIntArray();
let bigIntArrayByteCount = getAllocatedByteCount() - allocatedByteCount;
bigIntArray.length = 0;

allocatedByteCount = getAllocatedByteCount();
let tupleArray = getTupleArray();
let tupleArrayByteCount = getAllocatedByteCount() - allocatedByteCount;
tupleArray.length = 0;

console.log( `Number array: ${ numberArrayByteCount } bytes` );
console.log( `Number value: ${ numberArrayByteCount / arraySize } bytes` );

console.log( `BigInt array: ${ bigIntArrayByteCount } bytes` );
console.log( `BigInt value: ${ bigIntArrayByteCount / arraySize } bytes` );

console.log( `Tuple array: ${ tupleArrayByteCount } bytes` );
console.log( `Tuple value: ${ tupleArrayByteCount / arraySize } bytes` );

/*
Number array: 801768 bytes
Number value: 8.01768 bytes
BigInt array: 2313552 bytes
BigInt value: 23.13552 bytes
Tuple array: 5107832 bytes
Tuple value: 51.07832 bytes
*/