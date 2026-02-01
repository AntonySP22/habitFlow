# HabitFlow 🌱

> Sistema de monitoreo de rendimiento personal que transforma acciones diarias en series temporales de datos.

![Expo](https://img.shields.io/badge/Expo-54.0-000020?style=flat-square&logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat-square&logo=react)
![SQLite](https://img.shields.io/badge/SQLite-Local-003B57?style=flat-square&logo=sqlite)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)

## 📋 Descripción

HabitFlow es una aplicación móvil para el seguimiento de hábitos que utiliza un **Motor de Frecuencia** para filtrar la carga cognitiva del usuario, mostrando únicamente los hábitos relevantes para el día actual. El objetivo es cerrar el bucle de retroalimentación mediante gráficas de progreso en tiempo real.

## ✨ Características

### Dashboard Principal
- 📊 Vista filtrada de hábitos por día de la semana
- ✅ Checkboxes interactivos con actualización optimista (Optimistic UI)
- 📈 Barra de progreso animada del día actual
- 🏷️ Filtros por categoría

### Estadísticas
- 📉 Gráfica de línea suavizada (bezier) de los últimos 7-14 días
- 🔥 Contador de racha actual
- 📊 Promedio de completitud
- 💡 Consejos inteligentes basados en tu rendimiento

### Gestión de Hábitos
- ➕ Creación de hábitos con preview en vivo
- 🎨 Selector de color e iconos
- 📅 Selector de días tipo alarma iOS/Android
- ✏️ Edición y eliminación

### Configuración
- 🌓 Temas: Claro / Oscuro / Sistema
- 🗑️ Limpieza de historial
- ⚠️ Eliminación de datos

## 🛠️ Stack Tecnológico

| Tecnología | Propósito |
|------------|-----------|
| **Expo SDK 54** | Framework de desarrollo |
| **Expo Router 6** | Navegación basada en archivos |
| **expo-sqlite** | Base de datos local |
| **Zustand** | Gestión de estado |
| **react-native-chart-kit** | Gráficas |
| **@expo/vector-icons** | Iconografía |
| **AsyncStorage** | Persistencia de preferencias |

## 📁 Estructura del Proyecto

```
habitFlow/
├── app/                       # Expo Router (navegación)
│   ├── (tabs)/               # Tab Navigator
│   │   ├── index.tsx         # Dashboard
│   │   ├── stats.tsx         # Estadísticas
│   │   └── settings.tsx      # Configuración
│   ├── habit/
│   │   ├── create.tsx        # Crear hábito
│   │   └── [id].tsx          # Editar hábito
│   └── _layout.tsx           # Layout principal
├── components/               # Componentes reutilizables
│   ├── HabitCard.tsx
│   ├── ProgressChart.tsx
│   ├── CategoryFilter.tsx
│   ├── DaySelector.tsx
│   └── DashboardHeader.tsx
├── store/                    # Zustand stores
│   ├── habitStore.ts
│   └── themeStore.ts
├── database/                 # SQLite
│   ├── schema.ts
│   ├── init.ts
│   └── queries.ts
├── utils/
│   └── dateHelpers.ts
└── constants/
    ├── Colors.ts
    └── categories.ts
```

## 🗄️ Esquema de Base de Datos

### Table: `habits`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | Primary Key |
| name | TEXT | Nombre del hábito |
| category | TEXT | Categoría |
| frequency | TEXT | JSON array de días [0-6] |
| color | TEXT | Color hexadecimal |
| icon | TEXT | Nombre del icono |
| created_at | DATETIME | Fecha de creación |

### Table: `habit_logs`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | Primary Key |
| habit_id | INTEGER | FK → habits.id |
| date | TEXT | Fecha ISO (YYYY-MM-DD) |
| status | INTEGER | 1=Completado, 0=No |

### Table: `categories`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER | Primary Key |
| name | TEXT | Nombre único |
| color | TEXT | Color hexadecimal |
| icon | TEXT | Nombre del icono |

## 🚀 Instalación y Ejecución

```bash
# Clonar el proyecto
cd habitFlow

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios

# Ejecutar en Web
npm run web
```

## 📱 Capturas de Pantalla

*Las capturas se actualizarán una vez que la app esté corriendo.*

## 🔧 Cambios Respecto a la Especificación Original

| Aspecto Original | Implementación Final | Justificación |
|------------------|---------------------|---------------|
| react-native-gifted-charts | react-native-chart-kit | Mejor soporte con Expo y más estable |
| Lucide React Native | @expo/vector-icons | Viene incluido en Expo |
| Context API o Zustand | Zustand | Más ligero y simple para este caso |
| Backup/Export SQLite | Diferido a v2 | Complejidad adicional |

## 📝 Licencia

Este proyecto fue creado para uso personal.

---

**HabitFlow** - *Construye mejores hábitos, un día a la vez* 🌱
