# Application Theme & Main Components
This file contains the documentation for the core application skeleton, theme, and pages

## Theme
Primary Background: #FFFFFF
Sidebar Background: #202020
Yellow Accent: #EEBE02
Header Text: #2D2D2D
Main Text: #616161 

## Application Structure
This application is intended to be a single page application. The method of changing to different pages is using a sidebar. The sidebar holds the different pages:
- Live (Dashboard)
- Analytics
- Configuration
- Settings

Here is an sketch of the sidebar created using Figma 
![Sidebar Sketch](./SidebarComponent.png)

Please see the sidebar component: [SidebarComponent.md](./components/)

## Pages
Plans for each page is listed within the `planning/pages/` directory.
Each page sub-directory consists of a Figma sketch and a markdown file that describes what the page holds, its purpose, and any component it may contain. 

Pages:
- Live (Dashboard) Page: [LIVE_DASHBOARD_PAGE.md](./pages/LiveDashboardPage/LIVE_DASHBOARD_PAGE.md)
- Analytics Page: [ANALYITCS_PAGE.md](./pages/AnalyticsPage/ANALYTICS_PAGE.md)
- Configuration Page: [CONFIGURATION_PAGE.md](./pages/ConfigurationPage/CONFIGURATION_PAGE.md)
- Settings Page: [SETTINGS_PAGE.md](./pages/SettingsPage/SETTINGS_PAGE.md)

## Components
Plans for each component is listed within the `planning/components/` directory.
Each page sub-directory consists of a Figma sketch and a markdown file that describes what the component looks like, its function, and its variants.

Components:
- Sidebar: [SIDEBAR_COMPONENT.md](./components/SidebarComponent/SIDEBAR_COMPONENT.md)
- Button: [BUTTON_COMPONENT.md](./components/ButtonComponent/BUTTON_COMPONENT.md)
- Map: [MAP_COMPONENT.md](./components/MapComponent/MAP_COMPONENT.md)
- Analytics Card: [ANALYTICS_CARD.md](./components/AnalyticsCard/ANALYTICS_CARD.md)
- Dropdown: [DROPDOWN_COMPONENT.md](./components/DropdownComponent/DROPDOWN_COMPONENT.md)
- Header: [HEADER_COMPONENT.md](./components/HeaderComponent/HEADER_COMPONENT.md)
- Profile Image: [PROFILE_IMAGE_COMPONENT.md](./components/ProfileImageComponent/PROFILE_IMAGE_COMPONENT.md)
- Table: [TABLE_COMPONENT.md](./components/TableComponent/TABLE_COMPONENT.md)