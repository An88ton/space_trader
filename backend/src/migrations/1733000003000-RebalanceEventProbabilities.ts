import { MigrationInterface, QueryRunner } from 'typeorm';

export class RebalanceEventProbabilities1733000003000
  implements MigrationInterface
{
  name = 'RebalanceEventProbabilities1733000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rebalance travel event probabilities to make them more diverse
    // Reduce Safe Passage from 50 to 15 (was too common)
    // Increase other events to make them more frequent
    await queryRunner.query(`
      UPDATE "events"
      SET "probability" = 15
      WHERE "event_category" = 'safe_passage'
    `);

    await queryRunner.query(`
      UPDATE "events"
      SET "probability" = 20
      WHERE "event_category" = 'pirate_ambush'
    `);

    await queryRunner.query(`
      UPDATE "events"
      SET "probability" = 18
      WHERE "event_category" = 'engine_failure'
    `);

    await queryRunner.query(`
      UPDATE "events"
      SET "probability" = 15
      WHERE "event_category" = 'fuel_leak'
    `);

    await queryRunner.query(`
      UPDATE "events"
      SET "probability" = 18
      WHERE "event_category" = 'meteor_shower'
    `);

    await queryRunner.query(`
      UPDATE "events"
      SET "probability" = 14
      WHERE "event_category" = 'space_patrol'
    `);

    // Make Engine Failure and Meteor Shower interactive
    await queryRunner.query(`
      UPDATE "events"
      SET "requires_choice" = true
      WHERE "event_category" IN ('engine_failure', 'meteor_shower')
    `);

    // Add choices for Engine Failure
    const engineEvent = await queryRunner.query(`
      SELECT "id" FROM "events" WHERE "event_category" = 'engine_failure' LIMIT 1
    `);

    if (engineEvent.length > 0) {
      const eventId = engineEvent[0].id;

      // Choice 1: Emergency repairs (cost credits, no fuel loss)
      await queryRunner.query(
        `INSERT INTO "event_choices" ("event_id", "label", "description", "outcome", "sort_order")
         VALUES ($1, $2, $3, $4, $5)`,
        [
          eventId,
          'Emergency Repairs',
          'Pay for immediate repairs. Costs credits but prevents fuel loss.',
          JSON.stringify({
            creditsCost: 300,
            fuelModifier: 1.0,
            reputationChange: 0,
            description: 'You pay for emergency repairs. The issue is fixed quickly, and no fuel is lost.',
          }),
          0,
        ],
      );

      // Choice 2: Limp along (use extra fuel)
      await queryRunner.query(
        `INSERT INTO "event_choices" ("event_id", "label", "description", "outcome", "sort_order")
         VALUES ($1, $2, $3, $4, $5)`,
        [
          eventId,
          'Limp Along',
          'Continue with damaged engines. Consumes extra fuel but costs nothing.',
          JSON.stringify({
            fuelModifier: 1.5,
            reputationChange: 0,
            description: 'You continue with damaged engines. The journey consumes 50% more fuel.',
          }),
          1,
        ],
      );

      // Choice 3: Take time to fix (delay but minimal fuel loss)
      await queryRunner.query(
        `INSERT INTO "event_choices" ("event_id", "label", "description", "outcome", "sort_order")
         VALUES ($1, $2, $3, $4, $5)`,
        [
          eventId,
          'Take Time to Fix',
          'Stop and make proper repairs. Small fuel loss but proper fix.',
          JSON.stringify({
            fuelLoss: 5, // Fixed amount
            fuelModifier: 1.0,
            reputationChange: 2,
            description: 'You take time to properly fix the engines. Small fuel loss, but the repair is solid and your reputation increases.',
          }),
          2,
        ],
      );
    }

    // Add choices for Meteor Shower
    const meteorEvent = await queryRunner.query(`
      SELECT "id" FROM "events" WHERE "event_category" = 'meteor_shower' LIMIT 1
    `);

    if (meteorEvent.length > 0) {
      const eventId = meteorEvent[0].id;

      // Choice 1: Evasive maneuvers (risk cargo, but might avoid damage)
      await queryRunner.query(
        `INSERT INTO "event_choices" ("event_id", "label", "description", "outcome", "sort_order")
         VALUES ($1, $2, $3, $4, $5)`,
        [
          eventId,
          'Evasive Maneuvers',
          'Try to dodge the meteors. Risk of minor cargo damage.',
          JSON.stringify({
            cargoLossPercentage: 0.1,
            reputationChange: 2,
            description: 'You skillfully navigate through the meteor shower. Only minor cargo damage occurs.',
          }),
          0,
        ],
      );

      // Choice 2: Take shelter (more cargo loss, but safer)
      await queryRunner.query(
        `INSERT INTO "event_choices" ("event_id", "label", "description", "outcome", "sort_order")
         VALUES ($1, $2, $3, $4, $5)`,
        [
          eventId,
          'Take Shelter',
          'Hunker down and minimize damage. Moderate cargo loss but ship is safe.',
          JSON.stringify({
            cargoLossPercentage: 0.2,
            reputationChange: 0,
            description: 'You take shelter until the shower passes. Some cargo is damaged, but your ship remains intact.',
          }),
          1,
        ],
      );

      // Choice 3: Rush through (higher risk, might avoid damage)
      await queryRunner.query(
        `INSERT INTO "event_choices" ("event_id", "label", "description", "outcome", "sort_order")
         VALUES ($1, $2, $3, $4, $5)`,
        [
          eventId,
          'Rush Through',
          'Speed through quickly. High risk of damage, but might avoid it.',
          JSON.stringify({
            cargoLossPercentage: 0.3,
            reputationChange: -1,
            description: 'You rush through the meteor shower. Significant cargo damage occurs from the impacts.',
          }),
          2,
        ],
      );
    }

    // Make Fuel Leak interactive
    await queryRunner.query(`
      UPDATE "events"
      SET "requires_choice" = true
      WHERE "event_category" = 'fuel_leak'
    `);

    // Add choices for Fuel Leak
    const fuelLeakEvent = await queryRunner.query(`
      SELECT "id" FROM "events" WHERE "event_category" = 'fuel_leak' LIMIT 1
    `);

    if (fuelLeakEvent.length > 0) {
      const eventId = fuelLeakEvent[0].id;

      // Choice 1: Patch immediately (stop leak, small fuel loss)
      await queryRunner.query(
        `INSERT INTO "event_choices" ("event_id", "label", "description", "outcome", "sort_order")
         VALUES ($1, $2, $3, $4, $5)`,
        [
          eventId,
          'Patch Immediately',
          'Quickly patch the leak. Small fuel loss, quick fix.',
          JSON.stringify({
            fuelLoss: 10,
            reputationChange: 1,
            description: 'You quickly patch the leak. Minimal fuel is lost and the repair holds.',
          }),
          0,
        ],
      );

      // Choice 2: Let it drain (more fuel loss, but save time)
      await queryRunner.query(
        `INSERT INTO "event_choices" ("event_id", "label", "description", "outcome", "sort_order")
         VALUES ($1, $2, $3, $4, $5)`,
        [
          eventId,
          'Continue Journey',
          'Continue despite the leak. More fuel lost but no delay.',
          JSON.stringify({
            fuelLoss: 20,
            reputationChange: -1,
            description: 'You continue despite the leak. More fuel is lost, but you reach your destination on time.',
          }),
          1,
        ],
      );

      // Choice 3: Full repair (stop leak completely, cost credits)
      await queryRunner.query(
        `INSERT INTO "event_choices" ("event_id", "label", "description", "outcome", "sort_order")
         VALUES ($1, $2, $3, $4, $5)`,
        [
          eventId,
          'Full Repair',
          'Perform a proper repair. Costs credits but prevents fuel loss.',
          JSON.stringify({
            creditsCost: 250,
            fuelLoss: 0,
            reputationChange: 0,
            description: 'You perform a full repair on the fuel system. No fuel is lost, but the repair costs credits.',
          }),
          2,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert probabilities
    await queryRunner.query(`
      UPDATE "events"
      SET "probability" = 50
      WHERE "event_category" = 'safe_passage'
    `);

    await queryRunner.query(`
      UPDATE "events"
      SET "probability" = 15
      WHERE "event_category" = 'pirate_ambush'
    `);

    await queryRunner.query(`
      UPDATE "events"
      SET "probability" = 10
      WHERE "event_category" IN ('engine_failure', 'meteor_shower')
    `);

    await queryRunner.query(`
      UPDATE "events"
      SET "probability" = 8
      WHERE "event_category" = 'fuel_leak'
    `);

    await queryRunner.query(`
      UPDATE "events"
      SET "probability" = 7
      WHERE "event_category" = 'space_patrol'
    `);

    // Remove choices for engine_failure, meteor_shower, fuel_leak
    await queryRunner.query(`
      DELETE FROM "event_choices"
      WHERE "event_id" IN (
        SELECT "id" FROM "events" 
        WHERE "event_category" IN ('engine_failure', 'meteor_shower', 'fuel_leak')
      )
    `);

    // Remove requires_choice flag
    await queryRunner.query(`
      UPDATE "events"
      SET "requires_choice" = false
      WHERE "event_category" IN ('engine_failure', 'meteor_shower', 'fuel_leak')
    `);
  }
}
