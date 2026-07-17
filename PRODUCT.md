---
title: ERP Dashboard - Mi PyME
register: product
platform: web
version: 1.0.0
last_updated: 2026-07-17
---

# ERP Dashboard - Mi PyME

## Elevator Pitch
ERP Dashboard ligero, offline-first, para que pequeñas empresas gestionen inventario, órdenes y usuarios desde cualquier dispositivo sin depender de conexión constante.

## Target Audience
Pequeñas y medianas empresas mexicanas. Dueños de negocio y administradores no-técnicos que necesitan un sistema simple, rápido y que funcione sin internet.

## Jobs to Be Done
- Registrar y consultar productos del inventario
- Gestionar órdenes de clientes y su estado
- Exportar datos a Excel para contabilidad
- Respaldar la información en JSON
- Acceder desde celular o computadora

## Competitors
- Odoo (sobrecargado para PyMEs)
- Holded (caro, requiere internet)
- Spreadsheets (caótico a escala)

## Brand Personality
Serio pero accesible. Profesional sin ser corporativo frío. Confiable como un contador de confianza.

## Design Values
1. **Mobile-first** — la mayoría de consultas serán desde el teléfono
2. **Offline-resilient** — sin conexión no es excusa para no trabajar
3. **Clear hierarchy** — cada pantalla tiene una sola acción principal
4. **Speed** — transiciones instantáneas, sin esperas de red
5. **Forgiveness** — confirmaciones antes de borrar, feedback en cada acción

## Visual Direction
- Color primario: Azul profesional (#3b82f6) — transmite confianza
- Tema oscuro y claro
- Tipografía sans-serif limpia (Inter / system-ui)
- Tarjetas con sombra suave para datos clave
- Tablas con información densa pero legible

## Notes
Built with React + TypeScript + Tailwind CSS + Shadcn/ui + IndexedDB.
