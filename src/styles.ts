import FSConsts from './FSConsts'

const classes = FSConsts.cssClass

const styles = `
    <style>
        :root    {    
            ${FSConsts.cssVar.ratingColor}: #ccc;
        }   
        .${classes.resourceHint} {
           box-sizing: border-box;
           display: flex;
           justify-content: center;
           align-items: center;
           font-size: 14px;
           pointer-events: none;
        }
        
        .${classes.resourceHintSmall}{
           font-size: 10px;
        }
        
        .${classes.resourceHintContent} {
            padding: 5px;
            width: 50%;
            height: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #fd0100;
            color: white;
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
            background: var(${FSConsts.cssVar.ratingColor});
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
    </style>
`
export default styles
