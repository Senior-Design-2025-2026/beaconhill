# Configuration Page

The Configuration Page gives the user methods to configure farm and nodes.

Configuration Page
This page allows the user to configure node settings and tables remotely. The image of the Configuration page is not final. There should be for each configuration method, a section containing configuration buttons. There is to be a unlock button for each configuration section. Configurations should be locked until the user clicks the unlock button. 

## Data

This page works soley on the configuration data for the farms and for the nodes belonging to the farms. This page does not utilize any measurements taken in the field. 

DynamoDB Tables Used:
_[See DynamoDB.md](../../api/DynamoDB.md)_

1. FarmData 
2. NodeData

Node Data Schema:

## Components

- Header: [HEADER_COMPONENT.md](./../../components/HeaderComponent/HEADER_COMPONENT.md)
- Dropdown: [DROPDOWN_COMPONENT.md](./../../components/DropdownComponent/DROPDOWN_COMPONENT.md)
- Button: [BUTTON_COMPONENT.md](./../../components/ButtonComponent/BUTTON_COMPONENT.md)
- Input Box: [INPUT_BOX.md](./../../components/InputBoxConfigurationComponent/INPUT_BOX.md)

