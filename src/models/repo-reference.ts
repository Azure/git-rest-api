import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class RepoReference {
  @PrimaryColumn()
  public path: string;

  @Column("bigint")
  public lastUse: number;

  @Column("bigint")
  public lastFetch: number;

  constructor(ref: RepoReference) {
    this.path = ref.path;
    this.lastUse = ref.lastUse;
    this.lastFetch = ref.lastFetch;
  }
}
