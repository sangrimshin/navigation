const MathUtils = {

    DEG2RAD: Math.PI / 180,
    RAD2DEG: 180 / Math.PI,

    clamp: function ( value:number, min:number, max:number ) {

        return Math.max( min, Math.min( max, value ) );

    },

    // compute euclidian modulo of m % n
    // https://en.wikipedia.org/wiki/Modulo_operation

    euclideanModulo: function ( n:number, m:number ) {

        return ( ( n % m ) + m ) % m;

    },

    // Linear mapping from range <a1, a2> to range <b1, b2>

    mapLinear: function ( x:number, a1:number, a2:number, b1:number, b2:number ) {

        return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );

    },

    // https://en.wikipedia.org/wiki/Linear_interpolation

    lerp: function ( x:number, y:number, t:number ) {

        return ( 1 - t ) * x + t * y;

    },

    // http://en.wikipedia.org/wiki/Smoothstep

    smoothstep: function ( x:number, min:number, max:number ) {

        if ( x <= min ) return 0;
        if ( x >= max ) return 1;

        x = ( x - min ) / ( max - min );

        return x * x * ( 3 - 2 * x );

    },

    smootherstep: function ( x:number, min:number, max:number ) {

        if ( x <= min ) return 0;
        if ( x >= max ) return 1;

        x = ( x - min ) / ( max - min );

        return x * x * x * ( x * ( x * 6 - 15 ) + 10 );

    },

    // Random integer from <low, high> interval

    randInt: function ( low:number, high:number ) {

        return low + Math.floor( Math.random() * ( high - low + 1 ) );

    },

    // Random float from <low, high> interval

    randFloat: function ( low:number, high:number ) {

        return low + Math.random() * ( high - low );

    },

    // Random float from <-range/2, range/2> interval

    randFloatSpread: function ( range:number ) {

        return range * ( 0.5 - Math.random() );

    },

    // Deterministic pseudo-random float in the interval [ 0, 1 ]

    degToRad: function ( degrees:number ) {

        return degrees * MathUtils.DEG2RAD;

    },

    radToDeg: function ( radians:number ) {

        return radians * MathUtils.RAD2DEG;

    },

    isPowerOfTwo: function ( value:number ) {

        return ( value & ( value - 1 ) ) === 0 && value !== 0;

    },

    ceilPowerOfTwo: function ( value:number ) {

        return Math.pow( 2, Math.ceil( Math.log( value ) / Math.LN2 ) );

    },

    floorPowerOfTwo: function ( value:number ) {

        return Math.pow( 2, Math.floor( Math.log( value ) / Math.LN2 ) );

    }
};


export class Vector3 {

    x: number;
    y: number;
    z: number;

    constructor( x = 0, y = 0, z = 0 ) {

        Object.defineProperty( this, 'isVector3', { value: true } );

        this.x = x;
        this.y = y;
        this.z = z;

    }

    set( x: number, y: number, z: number ) {

        if ( z === undefined ) z = this.z; // sprite.scale.set(x,y)

        this.x = x;
        this.y = y;
        this.z = z;

        return this;

    }

    setScalar( scalar:number ) {

        this.x = scalar;
        this.y = scalar;
        this.z = scalar;

        return this;

    }

    setX( x:number ) {

        this.x = x;

        return this;

    }

    setY( y:number ) {

        this.y = y;

        return this;

    }

    setZ( z:number ) {

        this.z = z;

        return this;

    }

    setComponent( index:number, value:number ) {

        switch ( index ) {

            case 0: this.x = value; break;
            case 1: this.y = value; break;
            case 2: this.z = value; break;
            default: throw new Error( 'index is out of range: ' + index );

        }

        return this;

    }

    getComponent( index:number ) {

        switch ( index ) {

            case 0: return this.x;
            case 1: return this.y;
            case 2: return this.z;
            default: throw new Error( 'index is out of range: ' + index );

        }

    }

    clone() {

        return new Vector3( this.x, this.y, this.z );

    }

    copy( v :Vector3 ) {

        this.x = v.x;
        this.y = v.y;
        this.z = v.z;

        return this;

    }

    add( v : Vector3, w: Vector3 ) {

        if ( w !== undefined ) {

            console.warn( 'THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.' );
            return this.addVectors( v, w );

        }

        this.x += v.x;
        this.y += v.y;
        this.z += v.z;

        return this;

    }

    addScalar( s:number ) {

        this.x += s;
        this.y += s;
        this.z += s;

        return this;

    }

    addVectors( a:Vector3, b:Vector3 ) {

        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;

        return this;

    }

    addScaledVector( v: Vector3, s: number ) {

        this.x += v.x * s;
        this.y += v.y * s;
        this.z += v.z * s;

        return this;

    }

    sub( v: Vector3, w: Vector3 ) {

        if ( w !== undefined ) {

            console.warn( 'THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.' );
            return this.subVectors( v, w );

        }

        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;

        return this;

    }

    subScalar( s:number ) {

        this.x -= s;
        this.y -= s;
        this.z -= s;

        return this;

    }

    subVectors( a:Vector3, b:Vector3 ) {

        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;

        return this;

    }

    multiply( v:Vector3, w:Vector3 ) {

        if ( w !== undefined ) {

            console.warn( 'THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.' );
            return this.multiplyVectors( v, w );

        }

        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;

        return this;

    }

    multiplyScalar( scalar:number ) {

        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;

        return this;

    }

    multiplyVectors( a: Vector3, b: Vector3 ) {

        this.x = a.x * b.x;
        this.y = a.y * b.y;
        this.z = a.z * b.z;

        return this;

    }


    divide( v:Vector3 ) {

        this.x /= v.x;
        this.y /= v.y;
        this.z /= v.z;

        return this;

    }

    divideScalar( scalar:number ) {

        return this.multiplyScalar( 1 / scalar );

    }

    min( v:Vector3 ) {

        this.x = Math.min( this.x, v.x );
        this.y = Math.min( this.y, v.y );
        this.z = Math.min( this.z, v.z );

        return this;

    }

    max( v:Vector3 ) {

        this.x = Math.max( this.x, v.x );
        this.y = Math.max( this.y, v.y );
        this.z = Math.max( this.z, v.z );

        return this;

    }

    clamp( min:Vector3, max:Vector3 ) {

        this.x = Math.max( min.x, Math.min( max.x, this.x ) );
        this.y = Math.max( min.y, Math.min( max.y, this.y ) );
        this.z = Math.max( min.z, Math.min( max.z, this.z ) );

        return this;

    }

    clampScalar( minVal:number, maxVal:number ) {

        this.x = Math.max( minVal, Math.min( maxVal, this.x ) );
        this.y = Math.max( minVal, Math.min( maxVal, this.y ) );
        this.z = Math.max( minVal, Math.min( maxVal, this.z ) );

        return this;

    }

    clampLength( min:number, max:number ) {

        const length = this.length();

        return this.divideScalar( length || 1 ).multiplyScalar( Math.max( min, Math.min( max, length ) ) );

    }

    floor() {

        this.x = Math.floor( this.x );
        this.y = Math.floor( this.y );
        this.z = Math.floor( this.z );

        return this;

    }

    ceil() {

        this.x = Math.ceil( this.x );
        this.y = Math.ceil( this.y );
        this.z = Math.ceil( this.z );

        return this;

    }

    round() {

        this.x = Math.round( this.x );
        this.y = Math.round( this.y );
        this.z = Math.round( this.z );

        return this;

    }

    roundToZero() {

        this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
        this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
        this.z = ( this.z < 0 ) ? Math.ceil( this.z ) : Math.floor( this.z );

        return this;

    }

    negate() {

        this.x = - this.x;
        this.y = - this.y;
        this.z = - this.z;

        return this;

    }

    dot( v: Vector3 ) {

        return this.x * v.x + this.y * v.y + this.z * v.z;

    }

    // TODO lengthSquared?

    lengthSq() {

        return this.x * this.x + this.y * this.y + this.z * this.z;

    }

    length() {

        return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

    }

    manhattanLength() {

        return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

    }

    normalize() {

        return this.divideScalar( this.length() || 1 );

    }

    setLength( length:number ) {

        return this.normalize().multiplyScalar( length );

    }

    lerp( v: Vector3, alpha:number ) {

        this.x += ( v.x - this.x ) * alpha;
        this.y += ( v.y - this.y ) * alpha;
        this.z += ( v.z - this.z ) * alpha;

        return this;

    }

    lerpVectors( v1: Vector3, v2: Vector3, alpha:number ) {

        this.x = v1.x + ( v2.x - v1.x ) * alpha;
        this.y = v1.y + ( v2.y - v1.y ) * alpha;
        this.z = v1.z + ( v2.z - v1.z ) * alpha;

        return this;

    }

    cross( v: Vector3, w: Vector3 ) {

        if ( w !== undefined ) {

            console.warn( 'THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.' );
            return this.crossVectors( v, w );

        }

        return this.crossVectors( this, v );

    }

    crossVectors( a: Vector3, b: Vector3 ) {

        const ax = a.x, ay = a.y, az = a.z;
        const bx = b.x, by = b.y, bz = b.z;

        this.x = ay * bz - az * by;
        this.y = az * bx - ax * bz;
        this.z = ax * by - ay * bx;

        return this;

    }

    projectOnVector( v: Vector3 ) {

        const denominator = v.lengthSq();

        if ( denominator === 0 ) return this.set( 0, 0, 0 );

        const scalar = v.dot( this ) / denominator;

        return this.copy( v ).multiplyScalar( scalar );

    }


    angleTo( v: Vector3 ) {

        const denominator = Math.sqrt( this.lengthSq() * v.lengthSq() );

        if ( denominator === 0 ) return Math.PI / 2;

        const theta = this.dot( v ) / denominator;

        // clamp, to handle numerical problems

        return Math.acos( MathUtils.clamp( theta, - 1, 1 ) );

    }

    distanceTo( v:Vector3 ) {

        return Math.sqrt( this.distanceToSquared( v ) );

    }

    distanceToSquared( v:Vector3 ) {

        const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

        return dx * dx + dy * dy + dz * dz;

    }

    manhattanDistanceTo( v:Vector3 ) {

        return Math.abs( this.x - v.x ) + Math.abs( this.y - v.y ) + Math.abs( this.z - v.z );

    }

    equals( v:Vector3 ) {

        return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

    }

    fromArray( array:any[], offset:number ) {

        if ( offset === undefined ) offset = 0;

        this.x = array[ offset ];
        this.y = array[ offset + 1 ];
        this.z = array[ offset + 2 ];

        return this;

    }

    toArray( array:any[], offset:number ) {

        if ( array === undefined ) array = [];
        if ( offset === undefined ) offset = 0;

        array[ offset ] = this.x;
        array[ offset + 1 ] = this.y;
        array[ offset + 2 ] = this.z;

        return array;

    }

    random() {

        this.x = Math.random();
        this.y = Math.random();
        this.z = Math.random();

        return this;

    }

}


