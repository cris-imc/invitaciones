repo: cris-imc/invitaciones
branch: main
path: (whole repo referenced; key dirs: src/components/templates, src/components/invitation, src/components/wizard, docs/CRITERIOS_PLANTILLAS.md)

## Last sync
date: 2026-08-02T18:54:11Z

### Updated in this project
- Read wizard/section architecture (fixed section order) and existing 5 templates' design criteria (docs/CRITERIOS_PLANTILLAS.md).
- Copied 28 real event photos (img/casamiento/, img/15/, img/evento/) into project for use as design reference imagery.
- Built `Plantillas Premium.dc.html`: 6 premium template designs (2 per layout system × Boda/15 años), plus dev handoff notes.
- Built `Plantillas 15 Años.dc.html`: 6 premium 15-años-only designs (individual + familiar variants per layout), with tiered adulto/adolescente/niño pricing, dual alias (regalo/pago de tarjeta), and a post-RSVP family-composition mini wizard.
- Built `Plantillas Casamiento.dc.html`: 6 premium boda-only designs across 3 NEW layout systems (Cine documental, Atelier Nórdico, Riviera mediterráneo) distinct from the 15-años pack, each with a mobile (phone frame) and desktop (wide, multi-column) view toggle.

## Screen map
| Screen | Repo source |
|---|---|
| Plantillas Premium (6 designs) | docs/CRITERIOS_PLANTILLAS.md (section order/criteria), src/components/templates/*.tsx (existing pattern), img/casamiento/*, img/15/* (reference photos) |
| Plantillas 15 Años (6 designs) | same base + StepBankDetails.tsx / PersonalizedRsvpForm.tsx / RSVPWizardV2.tsx (fields extended: tiered pricing, dual alias, family RSVP step) |
| Plantillas Casamiento (6 designs) | same base, img/evento/* (extra reference photos), responsive mobile/desktop toggle simulating a real Tailwind breakpoint |
