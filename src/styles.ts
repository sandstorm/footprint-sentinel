import FSConsts from './FSConsts.ts'

const classes = FSConsts.cssClass
const vars = FSConsts.cssVar

const styles = `
    <style>
        .test {
            background: green;
            pointer-events: none;
        }
        
        .${classes.resourceDirty} {
          filter: var(${vars.resourceDirtyFilter});
        }
        
      

        .${classes.sentinel} {
            display: flex;
            flex-direction: column;
            align-items: end;
            position: fixed;
            bottom: 0;
            right: 0;
            font-size: 18px;
        }

        .${classes.sentinelStats} {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            background: #d3d3d3;
            transition-duration: 5000ms;
            transition-property: all;
            padding: 5px 10px;
            max-width: 100%;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
        }
        
        .${classes.sentinelStatsHide} {
            display: none;
        }

        .${classes.sentinelRow} {
            display: flex;
            flex-direction: row;
        }

        .${classes.sentinelLabel} {
            display: flex;
            align-items: center;
            font-size: 14px;
            line-height: 1.2;
        }

        .${classes.sentinelStats}[data-rating="A+"] {
           background: #00febc;
        }

        .${classes.sentinelStats}[data-rating="A"] {
           background: #1aff93;
        }

        .${classes.sentinelStats}[data-rating="B"] {
           background: #49ff42;
        }

        .${classes.sentinelStats}[data-rating="C"] {
           background: #70ff01;
        }

        .${classes.sentinelStats}[data-rating="D"] {
           background: #f9ff00;
        }

        .${classes.sentinelStats}[data-rating="E"] {
           background: #fea900;
           color: white;
        }

        .${classes.sentinelStats}[data-rating="F"] {
           background: #fd0100;
           color: white;
        }
    </style>
`
export default styles
