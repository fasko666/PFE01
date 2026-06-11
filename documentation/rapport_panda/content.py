# -*- coding: utf-8 -*-
"""Aggregates every content module into the final, numbered block list."""
from blocks_helpers import number
from c_front import front
from c_intro import intro
from c_ch1 import ch1
from c_ch2 import ch2
from c_ch3 import ch3
from c_ch4 import ch4
from c_ch5 import ch5
from c_ch6 import ch6
from c_back import back


def get_blocks():
    raw = (front() + intro() + ch1() + ch2() + ch3() + ch4() + ch5() + ch6() + back())
    return number(raw)
