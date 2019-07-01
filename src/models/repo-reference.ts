import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "repo_references" })
export class RepoReferenceRecord {
  @PrimaryColumn()
  public path!: string;

  @Column("bigint")
  public lastUse!: number;

  @Column("bigint", { nullable: true })
  public lastFetch?: number;
}
