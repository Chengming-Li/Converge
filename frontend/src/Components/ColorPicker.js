import React, { useState } from 'react';
import '../Styles/Components.css';

function ColorPicker({ setColor, setShowPicker }) {

    return (
        <div className='colorPicker'>
            <button className='circle' onClick={() => { setColor("#0b83d9"); setShowPicker(false); }} style={{ backgroundColor: "#0b83d9", left: "15px", top: "15px" }} />
            <button className='circle' onClick={() => { setColor("#9e5bd9"); setShowPicker(false); }} style={{ backgroundColor: "#9e5bd9", left: "48px", top: "15px" }} />
            <button className='circle' onClick={() => { setColor("#d94182"); setShowPicker(false); }} style={{ backgroundColor: "#d94182", left: "81px", top: "15px" }} />
            <button className='circle' onClick={() => { setColor("#e36a00"); setShowPicker(false); }} style={{ backgroundColor: "#e36a00", left: "114px", top: "15px" }} />
            <button className='circle' onClick={() => { setColor("#d92b2b"); setShowPicker(false); }} style={{ backgroundColor: "#d92b2b", left: "147px", top: "15px" }} />

            <button className='circle' onClick={() => { setColor("#bf7000"); setShowPicker(false); }} style={{ backgroundColor: "#bf7000", left: "15px", top: "48px" }} />
            <button className='circle' onClick={() => { setColor("#2da608"); setShowPicker(false); }} style={{ backgroundColor: "#2da608", left: "48px", top: "48px" }} />
            <button className='circle' onClick={() => { setColor("#06a893"); setShowPicker(false); }} style={{ backgroundColor: "#06a893", left: "81px", top: "48px" }} />
            <button className='circle' onClick={() => { setColor("#c9806b"); setShowPicker(false); }} style={{ backgroundColor: "#c9806b", left: "114px", top: "48px" }} />
            <button className='circle' onClick={() => { setColor("#525266"); setShowPicker(false); }} style={{ backgroundColor: "#525266", left: "147px", top: "48px" }} />

            <button className='circle' onClick={() => { setColor("#455ab1"); setShowPicker(false); }} style={{ backgroundColor: "#455ab1", left: "15px", top: "81px" }} />
            <button className='circle' onClick={() => { setColor("#990099"); setShowPicker(false); }} style={{ backgroundColor: "#990099", left: "48px", top: "81px" }} />
            <button className='circle' onClick={() => { setColor("#c7af14"); setShowPicker(false); }} style={{ backgroundColor: "#c7af14", left: "81px", top: "81px" }} />
            <button className='circle' onClick={() => { setColor("#566614"); setShowPicker(false); }} style={{ backgroundColor: "#566614", left: "114px", top: "81px" }} />
        </div>
    )
}

export default ColorPicker;