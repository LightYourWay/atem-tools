export interface ArtNetProtocol {
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
}