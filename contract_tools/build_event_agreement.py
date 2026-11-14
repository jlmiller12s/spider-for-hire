from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_ALIGN_VERTICAL, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "contracts"
OUTPUT_PATH = OUTPUT_DIR / "Spider-for-Hire-Event-Services-Agreement.docx"


NAVY = "10223D"
PALE_BLUE = "EDF3F8"
LIGHT_GRAY = "D9D9D9"
RED = "C82F3E"


def set_cell_shading(cell, fill: str):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=90, start=110, bottom=90, end=110):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for margin, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{margin}"))
        if node is None:
            node = OxmlElement(f"w:{margin}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_table_borders(table, color=LIGHT_GRAY, size="6"):
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.first_child_found_in("w:tblBorders")
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = f"w:{edge}"
        node = borders.find(qn(tag))
        if node is None:
            node = OxmlElement(tag)
            borders.append(node)
        node.set(qn("w:val"), "single")
        node.set(qn("w:sz"), size)
        node.set(qn("w:space"), "0")
        node.set(qn("w:color"), color)


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def set_font(run, name="Aptos", size=10.5, bold=False, color="000000", italic=False):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor.from_string(color)


def set_keep_with_next(paragraph, value=True):
    paragraph.paragraph_format.keep_with_next = value


def add_page_field(paragraph, field_code):
    run = paragraph.add_run()
    fld_char_1 = OxmlElement("w:fldChar")
    fld_char_1.set(qn("w:fldCharType"), "begin")
    instr_text = OxmlElement("w:instrText")
    instr_text.set(qn("xml:space"), "preserve")
    instr_text.text = field_code
    fld_char_2 = OxmlElement("w:fldChar")
    fld_char_2.set(qn("w:fldCharType"), "end")
    run._r.append(fld_char_1)
    run._r.append(instr_text)
    run._r.append(fld_char_2)
    set_font(run, size=8.5, color="666666")


def add_clause(doc, number, heading, paragraphs=None, bullets=None):
    title = doc.add_paragraph(style="Heading 1")
    set_keep_with_next(title)
    run = title.add_run(f"{number}  {heading}")
    set_font(run, size=12, bold=True)
    if paragraphs:
        for text in paragraphs:
            p = doc.add_paragraph(text, style="Body Text")
            p.paragraph_format.keep_together = True
    if bullets:
        for text in bullets:
            p = doc.add_paragraph(style="List Bullet")
            p.paragraph_format.left_indent = Inches(0.26)
            p.paragraph_format.first_line_indent = Inches(-0.15)
            p.add_run(text)


def add_signature_line(doc, label, width_chars=58):
    p = doc.add_paragraph(style="Body Text")
    p.paragraph_format.space_after = Pt(6)
    r1 = p.add_run(f"{label}: ")
    set_font(r1, bold=True)
    r2 = p.add_run("_" * width_chars)
    set_font(r2)


def build_document():
    OUTPUT_DIR.mkdir(exist_ok=True)
    doc = Document()

    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(0.68)
    section.bottom_margin = Inches(0.62)
    section.left_margin = Inches(0.78)
    section.right_margin = Inches(0.78)

    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Aptos"
    normal._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
    normal.font.size = Pt(10.5)
    normal.font.color.rgb = RGBColor(0, 0, 0)
    normal.paragraph_format.space_after = Pt(5)
    normal.paragraph_format.line_spacing = 1.05

    body = styles["Body Text"]
    body.font.name = "Aptos"
    body._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
    body._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
    body.font.size = Pt(10.5)
    body.font.color.rgb = RGBColor(0, 0, 0)
    body.paragraph_format.space_after = Pt(5)
    body.paragraph_format.line_spacing = 1.05

    title_style = styles["Title"]
    title_style.font.name = "Aptos Display"
    title_style._element.rPr.rFonts.set(qn("w:ascii"), "Aptos Display")
    title_style._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos Display")
    title_style.font.size = Pt(24)
    title_style.font.bold = True
    title_style.font.color.rgb = RGBColor(0, 0, 0)
    title_style.paragraph_format.space_after = Pt(6)
    title_ppr = title_style._element.get_or_add_pPr()
    title_border = title_ppr.find(qn("w:pBdr"))
    if title_border is not None:
        title_ppr.remove(title_border)

    heading_1 = styles["Heading 1"]
    heading_1.font.name = "Aptos Display"
    heading_1._element.rPr.rFonts.set(qn("w:ascii"), "Aptos Display")
    heading_1._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos Display")
    heading_1.font.size = Pt(12)
    heading_1.font.bold = True
    heading_1.font.color.rgb = RGBColor(0, 0, 0)
    heading_1.paragraph_format.space_before = Pt(8)
    heading_1.paragraph_format.space_after = Pt(3)

    header = section.header
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = hp.add_run("SPIDER FOR HIRE")
    set_font(run, size=8.5, bold=True, color=RED)

    footer = section.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = fp.add_run("Spider for Hire Event Services Agreement  |  Version 2026-11-14  |  Page ")
    set_font(r, size=8.5, color="666666")
    add_page_field(fp, "PAGE")
    r = fp.add_run(" of ")
    set_font(r, size=8.5, color="666666")
    add_page_field(fp, "NUMPAGES")

    brand = doc.add_paragraph()
    brand.paragraph_format.space_after = Pt(2)
    br = brand.add_run("SPIDER FOR HIRE")
    set_font(br, size=11, bold=True, color=RED)

    title = doc.add_paragraph(style="Title")
    title.add_run("Event Services Agreement")

    intro = doc.add_paragraph(style="Body Text")
    intro.paragraph_format.space_after = Pt(8)
    intro.add_run(
        "This Event Services Agreement is between Jimmie Miller, operating under the name Spider for Hire "
        "(the Performer), and the adult identified below (the Client). It covers the costumed entertainment "
        "services and event details listed in this agreement. The Client must be at least 18 years old and "
        "authorized to book the event."
    )

    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(2.05)
    table.columns[1].width = Inches(4.75)
    set_table_borders(table)
    hdr = table.rows[0]
    set_repeat_table_header(hdr)
    hdr.cells[0].merge(hdr.cells[1])
    set_cell_shading(hdr.cells[0], NAVY)
    set_cell_margins(hdr.cells[0], top=100, bottom=100)
    p = hdr.cells[0].paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    rr = p.add_run("BOOKING DETAILS")
    set_font(rr, size=10.5, bold=True, color="FFFFFF")

    details = [
        ("Client legal name", ""),
        ("Email and mobile phone", ""),
        ("Event date", ""),
        ("Performance start and end time", ""),
        ("Venue name and complete address", ""),
        ("Event type and guest of honor", ""),
        ("Package and included activities", ""),
        ("Expected number and ages of children", ""),
        ("Total event fee", "$"),
        ("Reservation payment", "$"),
        ("Remaining balance and due date", "$"),
        ("Travel fee or approved add ons", "$"),
        ("Accessibility needs and agreed changes", ""),
    ]
    for index, (label, value) in enumerate(details):
        cells = table.add_row().cells
        for cell in cells:
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            set_cell_margins(cell)
        if index % 2:
            set_cell_shading(cells[0], PALE_BLUE)
            set_cell_shading(cells[1], PALE_BLUE)
        pr = cells[0].paragraphs[0]
        run = pr.add_run(label)
        set_font(run, size=9.5, bold=True)
        pv = cells[1].paragraphs[0]
        run = pv.add_run((value + " " if value else "") + "_" * 48)
        set_font(run, size=9.5)

    add_clause(
        doc,
        "1",
        "Booking and Scope of Services",
        paragraphs=[
            "The Performer will provide the package and activities listed in the Booking Details. The Performer may make reasonable changes to the order, format, or length of individual activities to match the children, venue, weather, accessibility needs, or safety conditions. The Performer does not guarantee a particular reaction from any child or guest.",
            "The date is reserved only after both parties accept this agreement, the reservation payment clears, and the Performer sends written confirmation. A payment made before written confirmation is subject to availability and will be refunded if the Performer cannot accept the booking.",
        ],
    )

    add_clause(
        doc,
        "2",
        "Payment Terms",
        paragraphs=[
            "The Client will pay the total event fee and any approved travel, parking, overtime, or add-on charges shown in the Booking Details. The reservation payment is credited toward the total fee. Unless the Booking Details state otherwise, the remaining balance is due seven calendar days before the event. The Performer may decline to perform if the balance has not been paid when due.",
            "The Client authorizes the Performer and the payment processor to issue receipts and retain payment records connected with this booking. If the Client disputes a charge, the Client will first contact the Performer at jimmie@altaredalchemie.com and allow five business days for a response when practical. Nothing in this agreement waives a cardholder right that cannot legally be waived.",
        ],
    )

    add_clause(
        doc,
        "3",
        "Client Cancellation and Rescheduling",
        paragraphs=[
            "The reservation payment compensates the Performer for holding the date and turning away other work. It is nonrefundable after the Performer confirms the booking, except when this agreement expressly requires a refund.",
        ],
        bullets=[
            "If the Client cancels at least 14 calendar days before the event, the reservation payment is retained and any additional amount paid is refunded.",
            "If the Client cancels 8 to 13 calendar days before the event, 50 percent of the total event fee is due. Any amount paid above that figure is refunded.",
            "If the Client cancels 7 or fewer calendar days before the event, the full event fee is due.",
            "With at least 14 calendar days notice, the Client may request one transfer of the reservation payment to a new date within six months. The new date is subject to availability. A second change, a late change, or a change outside the six-month period may be treated as a cancellation.",
        ],
    )

    add_clause(
        doc,
        "4",
        "Performer Cancellation and Unavoidable Events",
        paragraphs=[
            "If illness, injury, unsafe travel, severe weather, government action, venue closure, family emergency, or another event beyond reasonable control prevents the performance, the parties will first try to reschedule within six months. If the Performer cancels and the parties cannot agree on a new date, the Performer will refund all amounts paid. That refund is the Client's exclusive monetary remedy for a Performer cancellation, except where applicable law requires otherwise.",
            "For outdoor events, the Client must provide a safe indoor alternative when lightning, extreme heat or cold, poor air quality, high winds, rain, or another condition makes outdoor performance unsafe. The Performer may stop, shorten, or relocate activities when reasonably necessary for safety. Amounts paid are not refundable when the Client declines an available safe alternative.",
        ],
    )

    add_clause(
        doc,
        "5",
        "Timing Event Changes and Overtime",
        paragraphs=[
            "The Client will provide accurate directions, parking information, access instructions, and a contact who can answer the phone before and during arrival. Delays caused by the Client, guests, or venue do not extend the scheduled end time unless the Performer agrees and is available. Approved overtime will be billed in 15-minute increments at the rate stated in the Booking Details or, if no rate is stated, at a rate agreed in writing before the overtime begins.",
            "If the Performer arrives late, the Performer will use reasonable efforts to provide the full booked time. If that is not possible, the Client will receive a proportional refund for time not performed. Changes to the date, location, duration, package, or expected attendance require the Performer's written approval and may change the price.",
        ],
    )

    add_clause(
        doc,
        "6",
        "Adult Supervision and Participant Conduct",
        paragraphs=[
            "A responsible adult must remain present and attentive throughout the performance. The Performer is an entertainer, not a babysitter or childcare provider, and will not be left in sole supervision of any child. The Client is responsible for guests, crowd control, venue rules, and obtaining permission from the venue and participants' parents or guardians when required.",
        ],
        bullets=[
            "Guests must not pull the mask or costume, strike or climb on the Performer, attempt unsafe stunts, use weapons, or interfere with the Performer or equipment.",
            "Pets must be secured away from the performance area unless the Performer approves otherwise in writing.",
            "The Client will disclose known accessibility, allergy, medical, sensory, behavioral, or mobility needs that may require a reasonable change to the activities, without disclosing more medical information than necessary.",
            "The Performer may pause or end the performance if a person, animal, object, or condition creates a safety risk, or if harassment, threats, intoxication, illegal conduct, or repeated interference continues after a reasonable request to stop. No refund is due when the Client or a guest causes early termination.",
        ],
    )

    add_clause(
        doc,
        "7",
        "Activities and Assumption of Ordinary Risk",
        paragraphs=[
            "Games may include walking, running, jumping, posing, dancing, and other age-appropriate movement. Participation is voluntary. The Client will provide a clear, dry, well-lit performance area free from obstacles and will stop any participant who cannot safely join an activity.",
            "To the extent permitted by law, the Client accepts the ordinary risks inherent in voluntary movement activities and releases the Performer from claims caused solely by those inherent risks or by conditions under the Client's or venue's control. This section does not release claims caused by the Performer's negligence, gross negligence, recklessness, willful misconduct, or any liability that cannot legally be waived.",
        ],
    )

    add_clause(
        doc,
        "8",
        "Photography Video and Personal Use",
        paragraphs=[
            "The Client and guests may photograph or record the performance for personal, noncommercial use. They may share those recordings on personal social-media accounts. They may not sell the recordings, use them in paid advertising, train an artificial-intelligence system with them, imply an endorsement, or license them to another business without the Performer's written permission.",
            "The Performer will not use a recognizable image, voice, or video of a minor for marketing unless that minor's parent or legal guardian has given written permission. The Client may consent only for the Client and for a minor for whom the Client is the parent or legal guardian. Permission for one child does not cover other children or guests. The optional media release below is not a condition of booking.",
            "For a hospital, clinic, school, or similar facility, photography or recording also requires any separate approval required by the facility. The Performer will not intentionally publish a facility logo, patient information, medical information, or another person's identifiable image without appropriate permission.",
        ],
    )

    media_heading = doc.add_paragraph(style="Heading 1")
    set_keep_with_next(media_heading)
    run = media_heading.add_run("Optional Media Release")
    set_font(run, size=12, bold=True)
    media = doc.add_paragraph(style="Body Text")
    media.paragraph_format.keep_together = True
    media.add_run(
        "Choose one option. A yes choice gives the Performer a nonexclusive, royalty-free license to use approved photos, video, and audio on the Spider for Hire website, portfolio, and social-media accounts to promote the business. The Performer will not sell the media to third parties or use it in a misleading, defamatory, or sensitive context. The signer may revoke permission for future use by emailing jimmie@altaredalchemie.com, but material already printed, distributed, or posted before the Performer receives that request may remain in use."
    )
    p = doc.add_paragraph(style="Body Text")
    p.paragraph_format.space_before = Pt(4)
    p.add_run("[  ] YES, I consent for myself and the following minor child or children for whom I am the parent or legal guardian: ").bold = True
    p.add_run("____________________________________________")
    p = doc.add_paragraph(style="Body Text")
    p.add_run("[  ] NO, I do not grant marketing permission.").bold = True
    p = doc.add_paragraph(style="Body Text")
    p.add_run("Parent or guardian initials: ").bold = True
    p.add_run("____________________")

    add_clause(
        doc,
        "9",
        "Property and Venue Responsibility",
        paragraphs=[
            "The Client is responsible for the venue, decorations, furniture, food, animals, equipment, and personal property at the event. The Performer is responsible for damage directly caused by the Performer's negligence. The Performer is not responsible for ordinary wear, accidental contact inherent in agreed activities, or damage caused by guests, venue conditions, or property not disclosed as fragile or hazardous.",
        ],
    )

    add_clause(
        doc,
        "10",
        "Independent Character Entertainment",
        paragraphs=[
            "Spider for Hire is an independent costumed entertainment service. It is not affiliated with, sponsored by, or endorsed by Marvel, Disney, Sony, or any other studio, publisher, or rights holder. The Client will not advertise the Performer as an official representative of a rights holder. Any character names supplied by the Client describe the requested theme only and do not create an affiliation or license.",
        ],
    )

    add_clause(
        doc,
        "11",
        "Indemnification and Limits on Liability",
        paragraphs=[
            "The Client will defend and indemnify the Performer against third-party claims, damages, and reasonable costs to the extent caused by the Client's breach of this agreement, lack of authority or permission, unsafe venue condition under the Client's control, or negligent or intentional act of the Client or a guest. This obligation does not apply to the extent a claim was caused by the Performer's negligence, gross negligence, recklessness, or willful misconduct.",
            "To the extent permitted by law, neither party is liable to the other for indirect, incidental, special, exemplary, or consequential damages, including lost profits or emotional distress arising only from cancellation or disappointment. Except for unpaid fees, indemnification obligations, fraud, willful misconduct, gross negligence, personal injury caused by negligence, or liability that cannot legally be limited, each party's total liability under this agreement will not exceed the total event fee paid or payable.",
        ],
    )

    add_clause(
        doc,
        "12",
        "Disputes and Missouri Law",
        paragraphs=[
            "Before filing a claim, a party will send written notice describing the dispute and the requested resolution. The parties will make a good-faith effort to resolve the dispute for at least 30 days after the notice is received. Either party may still seek emergency relief or file an eligible claim in small-claims court.",
            "Missouri law governs this agreement, without regard to conflict-of-law rules. Any court proceeding that is not eligible for small-claims court must be brought in a state or federal court serving St. Louis County, Missouri, and each party consents to that venue. Each party will bear its own attorneys' fees unless a statute or court order provides otherwise.",
        ],
    )

    add_clause(
        doc,
        "13",
        "General Terms",
        paragraphs=[
            "This agreement, the completed Booking Details, and any written addendum are the entire agreement. If they conflict, a later written addendum signed by both parties controls. A change or waiver must be in writing. Email and an electronic signature platform count as writing for this purpose.",
            "The Client may not transfer this booking to another person or commercial event without the Performer's written approval. If a provision is unenforceable, it will be limited only as much as necessary and the remaining provisions will continue in effect. A party's delay in enforcing a right does not waive that right. Notices may be sent to the email addresses in the Booking Details and are effective when sent, unless the sender receives a delivery failure notice.",
        ],
    )

    add_clause(
        doc,
        "14",
        "Electronic Signatures and Records",
        paragraphs=[
            "The parties agree to use electronic records and signatures. Typing a name, drawing a signature, checking an agreement box linked to this agreement, or using an electronic-signature service with the intent to agree counts as an electronic signature. A payment counts as acceptance only when the checkout page clearly links to this agreement and requires the payer to affirm agreement before submitting payment.",
            "Each party may download, print, and retain a complete copy. The electronic record should identify the agreement version, signer, email address, date and time, event details, and accepted terms. Electronic copies and counterparts are treated as originals and together form one agreement.",
        ],
    )

    sig_title = doc.add_paragraph(style="Heading 1")
    set_keep_with_next(sig_title)
    run = sig_title.add_run("Signatures")
    set_font(run, size=12, bold=True)

    consent = doc.add_paragraph(style="Body Text")
    consent.paragraph_format.keep_together = True
    r = consent.add_run("CLIENT ACKNOWLEDGMENT  ")
    set_font(r, bold=True)
    consent.add_run(
        "I am at least 18 years old, I have reviewed the completed Booking Details and all 14 sections, I intend to be legally bound, and I consent to receive and sign this agreement electronically."
    )

    add_signature_line(doc, "Client electronic signature")
    add_signature_line(doc, "Client printed legal name")
    add_signature_line(doc, "Client email")
    add_signature_line(doc, "Date and time signed")
    add_signature_line(doc, "Agreement version or booking number")

    doc.add_paragraph()
    add_signature_line(doc, "Performer electronic signature")
    add_signature_line(doc, "Performer printed name", width_chars=46)
    add_signature_line(doc, "Date and time accepted")

    doc.add_paragraph()
    final = doc.add_paragraph(style="Body Text")
    final.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = final.add_run("BOOKING CONTACT  jimmie@altaredalchemie.com")
    set_font(run, size=9.5, bold=True, color=NAVY)

    core = doc.core_properties
    core.title = "Spider for Hire Event Services Agreement"
    core.subject = "Reusable event entertainment agreement with electronic signature and optional media release"
    core.author = "Spider for Hire"
    core.keywords = "event agreement, entertainment, electronic signature, photography release"
    core.comments = "Version 2026-11-14"

    doc.save(OUTPUT_PATH)
    print(OUTPUT_PATH)


if __name__ == "__main__":
    build_document()
