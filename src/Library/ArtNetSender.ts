import { ArtNetProtocol } from '../Interfaces/ArtNetProtocol'
import dgram = require('dgram');
import { DMX } from '../Interfaces/DMX'

export class ArtNetSender implements ArtNetProtocol {
    ID: number[]
    OpCode: number[]
    ProtVerHi: number[]
    ProtVerLo: number[]
    Sequence: number[]
    Physical: number[]
    SubUni: number[]
    Net: number[]
    LengthHi: number[]
    Length: number[]
    Data: number[]

    ip: string
    socket: dgram.Socket
    loop: NodeJS.Timeout

    constructor(ip: string, net: number, subuni: number) {
        this.ip = ip

        
        /**
         * @name ID
         * @typedef int8
         * Array of 8 characters, the final character is a
         * null termination.
         * 
         * Value = ‘A’ ‘r’ ‘t’ ‘-‘ ‘N’ ‘e’ ‘t’ 0x00
         */
        let charArray = ['A', 'r', 't', '-', 'N', 'e', 't', String.fromCharCode(0x00)]
        this.ID = charArray.map(x => x.charCodeAt(0))
        //console.log(ID)



        /**
         * @name OpCode
         * @typedef int16
         * OpOutput
         * Transmitted low byte first
         */
        let OpOutput = 0x5000
        this.OpCode = [OpOutput & 0xff, OpOutput >> 8]
        //console.log(OpCode)



        /**
         * @name ProtVerHi
         * @typedef int8
         * High byte of the Art-Net protocol revision
         * number. 
         */
        this.ProtVerHi = [0]
        //console.log(ProtVerHi)

        /**
         * @name ProtVerLo
         * @typedef int8
         * Low byte of the Art-Net protocol revision
         * number. Current value 14
         */
        this.ProtVerLo = [14]
        //console.log(ProtVerLo)



        /**
         * @name Sequence
         * @typedef int8
         * The sequence number is used to ensure that
         * ArtDmx packets are used in the correct order.
         * When Art-Net is carried over a medium such as
         * the Internet, it is possible that ArtDmx packets
         * will reach the receiver out of order.
         * This field is incremented in the range 0x01 to
         * 0xff to allow the receiving node to resequence
         * packets.
         * The Sequence field is set to 0x00 to disable this
         * feature.
         */
        this.Sequence = [0x00]
        //console.log(Sequence)



        /**
         * @name Physical
         * @typedef int8
         * The physical input port from which DMX512
         * data was input. This field is for information
         * only. Use Universe for data routing.
         */
        this.Physical = [0x00]
        //console.log(Physical)



        /**
         * @name LengthHi
         * @typedef int8
         * The length of the DMX512 data array. This
         * value should be an even number in the range 2
         * – 512.
         * It represents the number of DMX512 channels
         * encoded in packet. NB: Products which convert
         * Art-Net to DMX512 may opt to always send 512
         * channels.
         * High Byte.
         */
        let channelCount = 512
        this.LengthHi = [channelCount >> 8]
        //console.log(LengthHi)

        /**
         * @name Length
         * @typedef int8
         * Low Byte of above.
         */
        this.Length = [channelCount & 0xff]
        //console.log(Length)


        /**
         * @name Data[Length]
         * @typedef int8
         * A variable length array of DMX512 lighting
         * data.
         */
        
        this.Data = this.createArray(512, 0)
        //console.log(Data)



        /**
         * @name SubUni
         * @typedef int8
         * The low byte of the 15 bit Port-Address to
         * which this packet is destined.
         */
        this.SubUni = [subuni | 0]
        //console.log(SubUni)



        /**
         * @name Net
         * @typedef int8
         * The top 7 bits of the 15 bit Port-Address to
         * which this packet is destined.
         */
        this.Net = [net | 0]
        //console.log(Net)


        // Bind Port and Adress
        this.socket = dgram.createSocket({type: 'udp4', reuseAddr: true}) 
        // this.socket.bind( 6454, "0.0.0.0", () => { this.socket.setBroadcast(true) } )


        // Run Main Loop
        this.loop = setInterval(() => this.main_loop(), 1000/30)
    }

    // HELPER FUNCTIONS
    private createArray(len: number, itm: any) {
        var arr1 = [itm],
            arr2: any[] = [];
        while (len > 0) {
            if (len & 1) arr2 = arr2.concat(arr1);
            arr1 = arr1.concat(arr1);
            len >>>= 1;
        }
        return arr2
    }
    
    private main_loop(): void {
        const Packet = Array.prototype.concat(this.ID, this.OpCode, this.ProtVerHi, this.ProtVerLo, this.Sequence, this.Physical, this.SubUni, this.Net, this.LengthHi, this.Length, this.Data)
        //console.log(Packet)
        const buffer = new Uint8Array(Packet)
        this.socket.send(buffer, 0, buffer.length, 6454, this.ip, function(err) {
            if (err) {
                throw new Error(err.message);
            }
        });
    }
    
    update(dmx: DMX) {
        Array.prototype.splice.apply(this.Data, [dmx.startDmx-1, dmx.data.length, ...dmx.data]);
    }

    stop() {
        clearInterval(this.loop)
        this.socket.close()
    }

}