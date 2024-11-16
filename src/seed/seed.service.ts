import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter,
  ){}
  
  async executeSeed() {

    await this.pokemonModel.deleteMany({}); // delete * from Pokemons

    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    //* 1. Esta es una forma de inserción de registros simultaneos
    // const insertPromisesArray = [];

    // data.results.forEach(({name, url}) => {
    //   const segments = url.split('/');
    //   const no:number = +segments[ segments.length - 2 ];
      
    //   // const pokemon = await this.pokemonModel.create({ name, no });
    //   insertPromisesArray.push(
    //     this.pokemonModel.create({ name, no })
    //   )
    // })

    // await Promise.all( insertPromisesArray );

    //* 2. Segun forma de inserción de registros simultaneos recomendada
    const pokemonToInsert: { name:string, no: number }[] = [];

    data.results.forEach(({name, url}) => {
      const segments = url.split('/');
      const no:number = +segments[ segments.length - 2 ];
      
      pokemonToInsert.push({ name, no });
    })

    await this.pokemonModel.insertMany( pokemonToInsert );

    return 'Seed Executed';
  }
}
