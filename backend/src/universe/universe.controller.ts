import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UniverseService } from './universe.service';
import { UniverseGenerationDto } from './dto/universe-generation.dto';
import { PathfindingDto } from './dto/pathfinding.dto';
import { hexDistance, hexPath, HexCoordinate } from '../utils/hex-coordinates';

@Controller('universe')
export class UniverseController {
  constructor(private readonly universeService: UniverseService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  async generateUniverse(@Body() dto: UniverseGenerationDto) {
    const result = await this.universeService.generateUniverse({
      hexRadius: dto.hexRadius,
      planetCount: dto.planetCount,
      seed: dto.seed,
    });
    return {
      message: 'Universe generated successfully',
      hexCount: result.hexes.length,
      planetCount: result.planets.length,
    };
  }

  @Get('hexes')
  async getHexes() {
    const hexes = await this.universeService.getAllHexes();
    return hexes.map((hex) => ({
      id: hex.id,
      q: hex.q,
      r: hex.r,
      hasPlanet: hex.hasPlanet,
    }));
  }

  @Get('planets')
  async getPlanets() {
    const planets = await this.universeService.getAllPlanets();
    return planets.map((planet) => ({
      id: planet.id,
      name: planet.name,
      hexQ: planet.hexQ,
      hexR: planet.hexR,
      planetType: planet.planetType,
      faction: planet.faction,
      securityLevel: planet.securityLevel,
      dockingFee: planet.dockingFee,
      resources: planet.resources,
      marketModifiers: planet.marketModifiers,
      eventWeights: planet.eventWeights,
    }));
  }

  @Get('map')
  async getMap() {
    const [hexes, planets, bounds] = await Promise.all([
      this.universeService.getAllHexes(),
      this.universeService.getAllPlanets(),
      this.universeService.getUniverseBounds(),
    ]);

    return {
      hexes: hexes.map((hex) => ({
        id: hex.id,
        q: hex.q,
        r: hex.r,
        hasPlanet: hex.hasPlanet,
      })),
      planets: planets.map((planet) => ({
        id: planet.id,
        name: planet.name,
        hexQ: planet.hexQ,
        hexR: planet.hexR,
        planetType: planet.planetType,
        faction: planet.faction,
        securityLevel: planet.securityLevel,
        dockingFee: planet.dockingFee,
        resources: planet.resources,
        marketModifiers: planet.marketModifiers,
        eventWeights: planet.eventWeights,
      })),
      bounds,
    };
  }

  @Get('hex/:q/:r')
  async getHex(@Param('q') q: string, @Param('r') r: string) {
    const hex = await this.universeService.getHexAt(parseInt(q, 10), parseInt(r, 10));
    if (!hex) {
      return null;
    }
    return {
      id: hex.id,
      q: hex.q,
      r: hex.r,
      hasPlanet: hex.hasPlanet,
    };
  }

  @Get('planet/:q/:r')
  async getPlanet(@Param('q') q: string, @Param('r') r: string) {
    const planet = await this.universeService.getPlanetAt(parseInt(q, 10), parseInt(r, 10));
    if (!planet) {
      return null;
    }
    return {
      id: planet.id,
      name: planet.name,
      hexQ: planet.hexQ,
      hexR: planet.hexR,
      planetType: planet.planetType,
      faction: planet.faction,
      securityLevel: planet.securityLevel,
      dockingFee: planet.dockingFee,
      resources: planet.resources,
      marketModifiers: planet.marketModifiers,
      eventWeights: planet.eventWeights,
    };
  }

  @Get('planet/:q/:r/market')
  async getPlanetMarket(@Param('q') q: string, @Param('r') r: string) {
    return this.universeService.getPlanetMarketPrices(parseInt(q, 10), parseInt(r, 10));
  }

  @Get('bounds')
  async getBounds() {
    return this.universeService.getUniverseBounds();
  }

  @Get('status')
  async getStatus() {
    const isGenerated = await this.universeService.isUniverseGenerated();
    return { isGenerated };
  }

  @Get('distance')
  async getDistance(@Query() query: PathfindingDto) {
    const from: HexCoordinate = { q: query.fromQ, r: query.fromR };
    const to: HexCoordinate = { q: query.toQ, r: query.toR };
    const distance = hexDistance(from, to);
    return { distance, from, to };
  }

  @Post('path')
  @HttpCode(HttpStatus.OK)
  async getPath(@Body() dto: PathfindingDto) {
    const from: HexCoordinate = { q: dto.fromQ, r: dto.fromR };
    const to: HexCoordinate = { q: dto.toQ, r: dto.toR };

    // Get all hexes to check passability
    const allHexes = await this.universeService.getAllHexes();
    const hexSet = new Set(allHexes.map((h) => `${h.q},${h.r}`));

    const isPassable = (hex: HexCoordinate) => {
      return hexSet.has(`${hex.q},${hex.r}`);
    };

    const path = hexPath(from, to, isPassable);
    const distance = path ? path.length - 1 : null;

    return {
      path: path || null,
      distance,
      from,
      to,
    };
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearUniverse() {
    await this.universeService.clearUniverse();
  }
}

