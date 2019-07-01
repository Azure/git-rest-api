import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class RepoReference {
  @PrimaryColumn()
  public path!: string;

  @Column("bigint")
  public lastUse!: number;

  @Column("bigint", { nullable: true })
  public lastFetch?: number;
}
