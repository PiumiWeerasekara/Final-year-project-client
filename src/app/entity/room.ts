export class Room {

  public id !: number;
  public number !: string;
  public equipments !: string;
  public status !: string;

  constructor(id: number, number: string, equipments: string, status: string) {
    this.id = id;
    this.number = number;
    this.equipments = equipments;
    this.status = status;
  }
}




