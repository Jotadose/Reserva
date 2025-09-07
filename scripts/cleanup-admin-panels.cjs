#!/usr/bin/env node

/**
 * Script para limpiar componentes legacy del panel de administración
 * 
 * Este script:
 * 1. Identifica componentes duplicados o legacy
 * 2. Actualiza imports que apunten a los componentes legacy
 * 3. Mueve componentes legacy a una carpeta deprecated/
 * 4. Genera un reporte de la limpieza realizada
 */

const fs = require('fs');
const path = require('path');

const COMPONENTS_PATH = '/workspaces/Reserva/apps/web/src/components';

// Componentes a deprecar
const LEGACY_COMPONENTS = [
  'AdminPanelModern.tsx',
  'AdminPanelProfessional.tsx', 
  'AdminPanelSimpleUpdated.tsx',
  'AdminPanelEnhanced.tsx',
  'AdminTabsNavigation.tsx',
  'AdminDashboardOptimizado.tsx',
  'AdminPanelProductionReady.tsx',
  'AdminPanelAdvanced_Fixed.tsx'
];

// Componente principal modernizado
const MAIN_COMPONENT = 'AdminPanelModernized.tsx';

// Crear carpeta deprecated
const DEPRECATED_PATH = path.join(COMPONENTS_PATH, 'deprecated');

async function createDeprecatedFolder() {
  if (!fs.existsSync(DEPRECATED_PATH)) {
    fs.mkdirSync(DEPRECATED_PATH, { recursive: true });
    console.log('✅ Carpeta deprecated/ creada');
  }
}

async function moveToDeprecated(componentName) {
  const sourcePath = path.join(COMPONENTS_PATH, componentName);
  const targetPath = path.join(DEPRECATED_PATH, componentName);
  
  if (fs.existsSync(sourcePath)) {
    fs.renameSync(sourcePath, targetPath);
    console.log(`📦 Movido ${componentName} a deprecated/`);
    return true;
  }
  return false;
}

async function updateImports() {
  // Buscar archivos que importen componentes legacy
  const filesToCheck = [
    path.join(COMPONENTS_PATH, 'AdminMasterComponent.tsx'),
    path.join(COMPONENTS_PATH, 'admin/index.ts'),
  ];
  
  for (const filePath of filesToCheck) {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let updated = false;
      
      // Actualizar imports legacy
      LEGACY_COMPONENTS.forEach(component => {
        const componentName = component.replace('.tsx', '');
        const importRegex = new RegExp(`import.*${componentName}.*from.*`, 'g');
        if (importRegex.test(content)) {
          content = content.replace(importRegex, `// DEPRECATED: ${componentName} moved to deprecated/`);
          updated = true;
        }
      });
      
      if (updated) {
        fs.writeFileSync(filePath, content);
        console.log(`🔄 Actualizado ${path.basename(filePath)}`);
      }
    }
  }
}

async function generateCleanupReport() {
  const reportContent = `# Reporte de Limpieza del Panel de Administración

## Fecha de Limpieza
${new Date().toISOString()}

## Componentes Movidos a Deprecated
${LEGACY_COMPONENTS.map(comp => `- ${comp}`).join('\n')}

## Componente Principal Activo
- ${MAIN_COMPONENT}

## Componentes Admin Avanzados Conservados
- AdminPanelModernized.tsx (Principal)
- admin/AgendaDisponibilidad.tsx
- admin/ConfiguracionHorariosTotal.tsx  
- admin/GestionBarberosAvanzada.tsx
- admin/GestionServicios.tsx
- admin/AdminBookingsView.tsx
- admin/AdminContext.tsx

## Próximos Pasos
1. Verificar que no hay referencias rotas
2. Testear el panel modernizado
3. Eliminar carpeta deprecated/ después de validación
4. Actualizar documentación

## Funcionalidades del Panel Modernizado
✅ Dashboard con estadísticas en tiempo real
✅ Gestión completa de reservas
✅ Administración de barberos
✅ Catálogo de servicios CRUD
✅ Agenda y disponibilidad
✅ Configuración de horarios
✅ Sistema de búsqueda y filtros
✅ Responsive design
✅ Hooks modernos integrados
`;

  fs.writeFileSync('/workspaces/Reserva/ADMIN_CLEANUP_REPORT.md', reportContent);
  console.log('📋 Reporte generado: ADMIN_CLEANUP_REPORT.md');
}

async function main() {
  console.log('🧹 Iniciando limpieza del panel de administración...\n');
  
  try {
    // Crear carpeta deprecated
    await createDeprecatedFolder();
    
    // Mover componentes legacy
    let movedCount = 0;
    for (const component of LEGACY_COMPONENTS) {
      const moved = await moveToDeprecated(component);
      if (moved) movedCount++;
    }
    
    // Actualizar imports
    await updateImports();
    
    // Generar reporte
    await generateCleanupReport();
    
    console.log(`\n✨ Limpieza completada!`);
    console.log(`📦 ${movedCount} componentes movidos a deprecated/`);
    console.log(`🎯 Panel principal: ${MAIN_COMPONENT}`);
    console.log(`📋 Ver reporte: ADMIN_CLEANUP_REPORT.md`);
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    process.exit(1);
  }
}

main();
