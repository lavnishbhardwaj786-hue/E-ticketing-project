import { Form } from "react-router-dom";
import Formmade from "../components/form-element";

const check = {
    text: "text",
    password: "password",
    email: "email",
}

function Commonelement({data = [], setformdata, formdata}) {
    function renderElement(formelemnt, index) {
        let content = null;
        switch (check[formelemnt.contenttype]) {
            case "text":
                return <Formmade key={index}
                    contenttype={formelemnt.contenttype}
                    name={formelemnt.name}
                    value={formdata[formelemnt.name]}
                    onChange={(e) =>
                        setformdata(
                            {
                                ...formdata, [formelemnt.name]: e.target.value
                            })} />;
            case "password":
                return <Formmade key={index}
                    contenttype={formelemnt.contenttype}
                    name={formelemnt.name}
                    value={formdata[formelemnt.name]}
                    onChange={(e) =>
                        setformdata(
                            {
                                ...formdata, [formelemnt.name]: e.target.value
                            })} />;
            case "email":
                return <Formmade key={index}
                    contenttype={formelemnt.contenttype}
                    name={formelemnt.name}
                    value={formdata[formelemnt.name]}
                    onChange={(e) => setformdata({ ...formdata, [formelemnt.name]: e.target.value })} />;
        }
        return content

    }
    return (<div>
        {data?.length > 0 ?
            data.map((item, index) => {
                return renderElement(item, index)
            })
            : <p>No form elements to render</p>}
    </div>
    )
}
export default Commonelement;