# Analytics Page
The Analytics Page provides a historical aggregation of the measurements taken within the field. 

![AnalyticsPage](./AnalyticsPage.png)

## Data 
This page utilizes the historical field measurements taken by the node devices. These will be plotted and simple statistical values will be given to show field measurements over a larger timeframe to give the farmer a more detailed understanding of farm. This data will be compared to the ambient values for the location of the farm. This will provide insights about how the ambient conditions affect the soil conditions. This data, and the future forecast of the farm location will be placed into an AI chatbot to give actionable insights to farmers about what chemical applicant should be applied to the field.

DynamoDB Tables Used:
- Farm (used to grab the approximate lat/lon of the farm)
- Measurements

## API 
In addition to the data pulled from the DynamoDB, the [Free Weather API](https://www.weatherapi.com/) (or an alternative) will be used to pull ambient temperatures, rainfall, and humidity of the location. 

The measurements will be filtered on the Farm, Node(s), and Timeframe selections. Each entry will contain these fields and will be used to select wanted measurement records.

## Components
- Header: [HEADER_COMPONENT.md](./../../components/HeaderComponent/HEADER_COMPONENT.md)
- Analytics Highlight Measurements: [ANALYTICS_CARD.md](./../../components/AnalyticsCardComponent/ANALYTICS_CARD.md)