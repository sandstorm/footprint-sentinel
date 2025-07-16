const styles = `
    <style>
        .footprint-guard {
            display: flex;
            flex-direction: column;
            align-items: end;
            position: fixed;
            bottom: 0;
            right: 0;
            font-size: 18px;
        }

        .footprint-guard__stats {
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

        .footprint-guard__row {
            display: flex;
            flex-direction: row;
        }

        .footprint-guard__label {
            display: flex;
            align-items: center;
            font-size: 14px;
            line-height: 1.2;
        }

        .footprint-guard__stats--hide {
            display: none;
        }

        .footprint-guard__stats[data-rating="A+"] {
           background: #00febc;
        }

        .footprint-guard__stats[data-rating="A"] {
           background: #1aff93;
        }

        .footprint-guard__stats[data-rating="B"] {
           background: #49ff42;
        }

        .footprint-guard__stats[data-rating="C"] {
           background: #70ff01;
        }

        .footprint-guard__stats[data-rating="D"] {
           background: #f9ff00;
        }

        .footprint-guard__stats[data-rating="E"] {
           background: #fea900;
           color: white;
        }

        .footprint-guard__stats[data-rating="F"] {
           background: #fd0100;
           color: white;
        }


        .footprint-guard__bytes {
            width: 100%;
        }

        .footprint-guard__size-transferred {
            font-size: 0.8em;
        }

        .footprint-guard-resource--force-relative {
            position: relative;
        }

        .footprint-guard-resource {
            z-index: 1;
            padding: 20px;
            position: absolute;
            top: 0;
            bottom: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
        }

        .footprint-guard-resource__content {
            display: none;
            transition-duration: 500ms;
            transition-property: all;
            padding: 20px;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            background: red;
            color: #fff;
            width: 50%;
            height: 50%;
        }


        .footprint-guard-resource--dirty .footprint-guard-resource__content {
            display: flex;
        }

        .footprint-guard-resource__bytes {
            text-wrap: nowrap;
            font-size: 18px;
            font-weight: bold;
        }

        .footprint-guard-resource__max {
            overflow: hidden;
            transition-property: all;
            transition-duration: 500ms;
            font-size: 0;
            line-height: 0;
            font-weight: bold;
        }

         .footprint-guard-resource:hover .footprint-guard-resource__content {
            min-width: 200px;
            min-height: 200px;
            width: 100%;
            height: 100%;
         }

        .footprint-guard-resource:hover .footprint-guard-resource__max {
            font-size: 12px;
            line-height: 1.4;
        }

    </style>
`
export default styles;
