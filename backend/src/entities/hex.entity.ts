import { Column, Entity, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Planet } from './planet.entity';

@Entity({ name: 'hexes' })
@Unique(['q', 'r'])
export class Hex {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  q: number; // Axial coordinate q

  @Column({ type: 'int' })
  r: number; // Axial coordinate r

  @Column({ type: 'boolean', default: false, name: 'has_planet' })
  hasPlanet: boolean;

  @OneToMany(() => Planet, (planet) => planet.hex)
  planets?: Planet[];
}

